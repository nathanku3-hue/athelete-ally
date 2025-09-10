# Athlete Ally - Your Intelligent Training Coach

AI-powered strength & conditioning platform with scientific periodization, customized for individual athletes.

## 🚀 Local Development Environment

**⚠️ IMPORTANT: The ONLY official way to run this project for development and testing is by using the Docker Compose-based preview environment.**

This ensures that all microservices, databases, and infrastructure are running in a consistent, isolated, and production-like context.

### Quick Start

**To start the entire system, run the following single command from the project root:**

```bash
npm run preview:up
```

**Do NOT run `npm run dev` in individual service or app directories, as this will lead to an incomplete and inconsistent environment.**

### Service URLs

Once started, you can access:
- **Frontend**: http://localhost:3000
- **Gateway BFF**: http://localhost:4000
- **API Docs**: http://localhost:4000/documentation
- **Jaeger Tracing**: http://localhost:16686
- **Prometheus Metrics**: http://localhost:9090
- **Grafana Dashboards**: http://localhost:3001

### Development Workflow

1. **Start the environment**: `npm run preview:up`
2. **Make code changes**: All changes are hot-reloaded automatically
3. **Test functionality**: Use the frontend at http://localhost:3000
4. **Stop the environment**: `npm run preview:down`

### Architecture

This project uses a microservices architecture with:
- **Frontend**: Next.js 14 with TypeScript
- **Gateway BFF**: API gateway and orchestration
- **Profile Onboarding**: User profile and preferences management
- **Planning Engine**: AI-powered workout plan generation
- **Exercises Service**: Exercise database and management
- **Fatigue Service**: Recovery and fatigue tracking
- **Monitoring**: Prometheus, Grafana, and Jaeger for observability

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
