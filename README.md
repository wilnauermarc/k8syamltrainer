# Kubernetes YAML Trainer 🚀

An interactive Kubernetes learning platform designed to help engineers practice writing, reviewing, and debugging Kubernetes manifests.

## Why?

Modern AI tools can generate Kubernetes YAML in seconds.

However, engineers still need to:

* Review manifests
* Understand Kubernetes resources
* Troubleshoot configuration issues
* Apply best practices
* Debug production incidents

This project focuses on building those skills through hands-on practice.

## Features

### YAML Challenges

Practice writing Kubernetes manifests from scratch.

Examples:

* Pod
* Deployment
* Service
* ConfigMap
* Secret
* Ingress
* PVC
* StatefulSet
* Job
* CronJob

### Manifest Validation

Get immediate feedback on:

* YAML syntax
* Required fields
* Kubernetes resource structure
* Common mistakes

### Best Practice Checks

Detect common anti-patterns such as:

* `image: latest`
* Missing resource requests
* Missing resource limits
* Missing readiness probes
* Missing liveness probes
* Single replica deployments
* Security misconfigurations

### Debugging Mode

Review intentionally broken manifests and fix issues such as:

* Label mismatches
* Selector problems
* Incorrect service configuration
* Resource configuration mistakes
* Deployment anti-patterns

### Progress Tracking

Track attempts, scores, streaks, and weak areas — stored locally in your browser.

## Learning Philosophy

This trainer is not about memorizing YAML.

It's about understanding Kubernetes.

Think of it this way:

AI can generate manifests.

You still need to know whether they're correct.

## Example Challenge

Create a production-ready Deployment:

Requirements:

* nginx:1.27
* 3 replicas
* Resource requests and limits
* Readiness probe
* Liveness probe

The trainer validates your solution and provides detailed feedback.

## Roadmap

Planned features:

* Interview mode
* Advanced debugging scenarios
* GitOps challenges
* ArgoCD exercises
* Helm support
* Kustomize support
* OpenShift-specific challenges
* Leaderboards

## Who Is This For?

* Kubernetes beginners
* DevOps Engineers
* Platform Engineers
* Cloud Engineers
* SREs
* Anyone preparing for Kubernetes interviews

## Contributing

Contributions, feedback, and ideas are welcome.

If you find a bug or have an idea for a new challenge, feel free to open an issue or submit a pull request.

## License

MIT License — see [LICENSE](LICENSE).

## Running the Web App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/train` | Training workspace |
| `/debug` | Fix broken manifests |
| `/progress` | Score history & streaks |

Optional support links (footer & homepage) via `.env.local` — see `.env.example`.
