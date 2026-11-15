import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { services } from "@/app/services";
import { Money } from "@/domain";
import { Button, Field, PhoneShell, ScreenTitle, Skeleton } from "@/ui";
import { useNames } from "../useNames";
import { addExpense, seedExpenses } from "../slice";
import styles from "./SplitScreen.module.css";

/** Trip · Split expenses: who pays whom, for everyone. */
export function SplitScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { expenses, seeded } = useAppSelector((s) => s.live);
  const travellers = useAppSelector((s) => s.book.travellers);
  const meId = useAppSelector((s) => s.group.meId);
  const bookedVia = useAppSelector((s) => s.book.bookedVia);
  const name = useNames();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(meId ?? "");

  useEffect(() => {
    if (bookedVia && !seeded) void dispatch(seedExpenses());
  }, [dispatch, bookedVia, seeded]);

  if (!bookedVia) return <Navigate to="/tribe/trip/ready" replace />;
  const transfers = services.splitter.settle(expenses);
  const rupees = Number(amount.replace(/[^\d]/g, ""));

  const add = () => {
    dispatch(
      addExpense({
        id: `e-${Date.now().toString(36)}`,
        title: title.trim(),
        amount: Money.fromRupees(rupees),
        paidBy,
        splitAmong: travellers.map((t) => t.memberId),
      }),
    );
    setTitle("");
    setAmount("");
  };

  return (
    <PhoneShell
      stage="Trip"
      backTo="/tribe/trip"
      footer={<Button block disabled={!seeded} onClick={() => navigate("/tribe/trip/settle")}>Next: Settle up</Button>}
    >
      <ScreenTitle title="Who owes who">Everything is split equally. Add anything we've missed.</ScreenTitle>

      {!seeded ? (
        <div className={styles.stack} aria-busy="true">
          {[0, 1, 2].map((i) => <Skeleton key={i} height={48} />)}
        </div>
      ) : (
        <>
          <ul className={styles.list}>
            {expenses.map((e) => (
              <li key={e.id} className={styles.row}>
                <span>
                  <b>{e.title}</b>
                  <em>Paid by {name(e.paidBy)}</em>
                </span>
                <span className={styles.amount}>{Money.format(e.amount)}</span>
              </li>
            ))}
          </ul>

          <section className={styles.form} aria-label="Add an expense">
            <Field label="What was it?" value={title} placeholder="Ferry tickets" onChange={(e) => setTitle(e.target.value)} />
            <div className={styles.pair}>
              <Field label="Amount" prefix="₹" inputMode="numeric" value={amount} onChange={(e) => {
                const d = e.target.value.replace(/[^\d]/g, "").slice(0, 7);
                setAmount(d ? Number(d).toLocaleString("en-IN") : "");
              }} />
              <label className={styles.select}>
                <span>Paid by</span>
                <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                  {travellers.map((t) => (
                    <option key={t.memberId} value={t.memberId}>{name(t.memberId)}</option>
                  ))}
                </select>
              </label>
            </div>
            <Button variant="secondary" block className={styles.tall} disabled={!title.trim() || !rupees} onClick={add}>
              Add expense
            </Button>
          </section>

          <h3 className={styles.h3}>Who pays whom</h3>
          <p className={styles.sub}>{transfers.length} {transfers.length === 1 ? "payment settles" : "payments settle"} everything.</p>
          <ul className={styles.list}>
            {transfers.map((t) => (
              <li key={`${t.from}>${t.to}`} className={styles.row}>
                <span><b>{name(t.from)}</b> pays <b>{name(t.to)}</b></span>
                <span className={styles.amount}>{Money.format(t.amount)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </PhoneShell>
  );
}
