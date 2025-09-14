
## Setup

   DEPLOYMENT= mini-buyer-lead-intake.vercel.app

1. **Clone the repo & install dependencies:**
	```bash
	git clone https://github.com/Navz-Sree/mini-buyer-lead-intake
	cd mini-buyer-lead-intake
	npm install
	```

2. **Configure environment:**
	- Copy `.env.example` to `.env` and fill in your secrets (see below).

	Example `.env`:
	```env
	DATABASE_URL="DATABASE_URL="postgresql://username:password@hostname:port/database_name"
	# NextAuth.js Configuration
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-secure-secret-key-32-characters-minimum"

    # Email Configuration (for magic link authentication)
    EMAIL_SERVER_HOST="smtp.gmail.com"
    EMAIL_SERVER_PORT="587"
    EMAIL_SERVER_USER="your-email@gmail.com"
    EMAIL_SERVER_PASSWORD="your-app-password"
    EMAIL_FROM="Your App Name <your-email@gmail.com>"

    # Additional Security Configuration
    JWT_SECRET="your-jwt-secret-key"

    # Environment
    NODE_ENV="development"

    # App Configuration
    APP_NAME="Mini Buyer Lead Intake App"
    APP_URL="http://localhost:3000"
	```

3. **Database setup:**
	```bash
	npx prisma migrate dev --name init
	npx prisma db seed
	```

4. **Run locally:**
	```bash
	npm run dev
	```

## Design Notes

- **Validation:** All form validation is handled with Zod schemas in `/lib/buyerSchema.ts` and enforced in both client and API routes.
- **SSR vs Client:** List and detail pages use SSR for initial data; forms and table actions are client components for interactivity.
- **Ownership Enforcement:** Buyer edit/delete is restricted to the owner or admin, checked in both UI and API.

## What’s Done vs Skipped

- **Done:** Full CRUD, validation, SSR pagination, CSV import/export, role-based access, a11y, error boundaries, toast notifications.
- **Skipped:** Production email delivery (uses test SMTP), advanced concurrency (demo only), full test coverage.
