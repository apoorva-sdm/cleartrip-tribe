import type { ReactNode } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { useAppSelector } from "./hooks";
import { LandingPage } from "@/features/landing";
import { MobileHome } from "@/features/home";
import { MyTribeScreen } from "@/features/mytribe";
import { ShareLinkScreen, StartTripScreen, selectTrip } from "@/features/setup";
import { BuildAvatarScreen, GroupStatusScreen, RevealScreen } from "@/features/avatars";
import { MatchScreen, PrivateConstraintsScreen } from "@/features/match";
import { DecisionScreen, VoteScreen } from "@/features/decide";
import { PlanScreen } from "@/features/plan";
import { ActivitiesStepScreen, ConfirmScreen, StayStepScreen, TravelStepScreen, TravellersScreen } from "@/features/book";
import { LearnScreen, SettleScreen, SplitScreen, TripDoneScreen, TripReadyScreen, TripScreen } from "@/features/trip";

/** Flow screens after "Start a trip" need a trip; otherwise start over. */
function RequireTrip({ children }: { children: ReactNode }) {
  const trip = useAppSelector(selectTrip);
  return trip ? children : <Navigate to="/tribe/start" replace />;
}

function RequireMe({ children }: { children: ReactNode }) {
  const meId = useAppSelector((s) => s.group.meId);
  return meId ? children : <Navigate to="/tribe/avatar" replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <MobileHome /> },
  { path: "/desktop", element: <LandingPage /> },
  { path: "/tribe/mine", element: <MyTribeScreen /> },
  // Setup
  { path: "/tribe/start", element: <StartTripScreen /> },
  { path: "/tribe/share", element: <RequireTrip><ShareLinkScreen /></RequireTrip> },
  // Avatars
  { path: "/tribe/avatar", element: <RequireTrip><BuildAvatarScreen /></RequireTrip> },
  { path: "/tribe/crew", element: <RequireTrip><RequireMe><GroupStatusScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/reveal", element: <RequireTrip><RequireMe><RevealScreen /></RequireMe></RequireTrip> },
  // Match
  { path: "/tribe/constraints", element: <RequireTrip><RequireMe><PrivateConstraintsScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/match", element: <RequireTrip><RequireMe><MatchScreen /></RequireMe></RequireTrip> },
  // Decide
  { path: "/tribe/vote", element: <RequireTrip><RequireMe><VoteScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/decision", element: <RequireTrip><RequireMe><DecisionScreen /></RequireMe></RequireTrip> },
  // Plan
  { path: "/tribe/plan", element: <RequireTrip><RequireMe><PlanScreen /></RequireMe></RequireTrip> },
  // Book
  { path: "/tribe/book/travel", element: <RequireTrip><RequireMe><TravelStepScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/book/stay", element: <RequireTrip><RequireMe><StayStepScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/book/activities", element: <RequireTrip><RequireMe><ActivitiesStepScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/book/review", element: <RequireTrip><RequireMe><ConfirmScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/book/travellers", element: <RequireTrip><RequireMe><TravellersScreen /></RequireMe></RequireTrip> },
  // Older links from the first build.
  { path: "/tribe/book/prices", element: <Navigate to="/tribe/book/travel" replace /> },
  { path: "/tribe/book/confirm", element: <Navigate to="/tribe/book/review" replace /> },
  // Trip
  { path: "/tribe/trip/ready", element: <RequireTrip><RequireMe><TripReadyScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/trip", element: <RequireTrip><RequireMe><TripScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/trip/split", element: <RequireTrip><RequireMe><SplitScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/trip/settle", element: <RequireTrip><RequireMe><SettleScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/trip/learn", element: <RequireTrip><RequireMe><LearnScreen /></RequireMe></RequireTrip> },
  { path: "/tribe/trip/done", element: <RequireTrip><RequireMe><TripDoneScreen /></RequireMe></RequireTrip> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
