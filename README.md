# CoinQuest

CoinQuest is a gamified student budgeting application designed to help users build better financial habits through quests, achievements, XP progression, savings goals, and transaction tracking.

## Final-project testing contribution

Kyle's [testing walkthrough](docs/kyle/START_HERE.md) links the static review, automated tests, before/after evidence, coverage, and AI-use record. See the [partner contribution summary](docs/kyle/CONTRIBUTION_SUMMARY.md) and [handoff to Bashir](docs/kyle/BASHIR_HANDOFF.md).

This branch proposes an atomic quest-completion RPC. The automated tests use synthetic local data and need no live Supabase access. Live quest completion on this branch requires the reviewed SQL migration; Kyle has accepted the two fixes after guided review; partner review, deployment and live verification remain pending. Read [CORRECTION_REVIEW.md](docs/kyle/CORRECTION_REVIEW.md) before using the changed frontend against Supabase.

## Features

* User Profiles
* XP and Leveling System
* Quest Completion Tracking
* Achievement Badge System
* Savings Goals
* Transaction Tracking
* Financial Analytics Dashboard
* Supabase Backend Integration

## Tech Stack

### Frontend

* React
* Vite
* CSS

### Backend & Database

* Supabase
* PostgreSQL

### Development Tools

* GitHub
* Postman

## Database Tables

* profiles
* quests
* transactions
* savings_goals
* achievements
* user_quests

## Current Progress

* Created Supabase project
* Designed PostgreSQL relational database schema
* Added profiles, quests, transactions, savings_goals, achievements, and user_quests tables
* Inserted sample data for testing
* Implemented XP and achievement system
* Created React frontend dashboard prototype
* Integrated frontend with Supabase backend
* Tested REST API endpoints using Postman
* Demonstrated data retrieval from all project tables
* Demonstrated data creation through POST requests
* Completed Full-Stack Integration project requirements

## Project Screenshots

Project screenshots are stored in:

frontend/screenshots/

Included screenshots demonstrate:

* React frontend dashboard
* Financial analytics dashboard
* Achievement system
* Savings goals
* Supabase database tables
* Postman API testing
* Data retrieval and data creation

## Project Goal

CoinQuest transforms personal budgeting into a gamified experience where users complete quests, earn XP, unlock achievements, and track savings goals while improving financial habits.
