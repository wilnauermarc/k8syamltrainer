import type { Exercise } from "../domain/types";

export const reviewExercises: Exercise[] = [
  {
    id: "review-beginner-svc-selector-001",
    title: "Service selector mismatch",
    description:
      "This Service is deployed but no traffic reaches the pods. Read the manifest and explain what's wrong.",
    mode: "review",
    difficulty: "beginner",
    expectedKinds: ["Service"],
    requirements: {
      requiredFields: [],
      expectedValues: [],
      requiredBestPractices: [],
    },
    scoringWeights: {
      correctness: 0.5,
      completeness: 0.1,
      best_practice: 0.3,
      interview_readiness: 0.1,
    },
    hints: ["Compare spec.selector with typical Pod labels"],
    learningObjectives: ["Understand Service selector vs Pod labels"],
    tags: ["service", "selector"],
    solutionYaml: "",
    brokenManifest: `apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 8080
`,
    reviewFindings: [
      {
        id: "svc_selector_mismatch",
        label: "Service selector does not match Pod labels",
        keywords: ["selector", "label", "frontend", "app=web", "mismatch", "match"],
        explanation:
          "Pods are labeled app=web but the Service selects app=frontend — no endpoints are matched.",
        recommendation: "Align spec.selector with the Pod template labels (app: web).",
      },
      {
        id: "target_port_mismatch",
        label: "targetPort does not match container port",
        keywords: ["targetport", "target port", "8080", "port 80", "containerport"],
        explanation:
          "targetPort 8080 does not match the container listening on port 80.",
        recommendation: "Set targetPort to 80 (or the actual containerPort).",
      },
    ],
  },
  {
    id: "review-beginner-image-latest-001",
    title: "Unpinned image and missing probes",
    description:
      "This Deployment runs in production. Identify all problems with this manifest.",
    mode: "review",
    difficulty: "beginner",
    expectedKinds: ["Deployment"],
    requirements: {
      requiredFields: [],
      expectedValues: [],
      requiredBestPractices: [],
    },
    scoringWeights: {
      correctness: 0.4,
      completeness: 0.1,
      best_practice: 0.4,
      interview_readiness: 0.1,
    },
    hints: ["Check the image tag and container health checks"],
    learningObjectives: ["Spot production anti-patterns in Deployments"],
    tags: ["deployment", "best-practice"],
    solutionYaml: "",
    brokenManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: myapi:latest
          ports:
            - containerPort: 8080
`,
    reviewFindings: [
      {
        id: "image_latest",
        label: "Image uses :latest tag",
        keywords: ["latest", "tag", "pin", "version", "immutable", "digest"],
        explanation: "The :latest tag is mutable and makes rollbacks unreliable.",
        recommendation: "Pin to a specific version, e.g. myapi:1.4.2.",
      },
      {
        id: "readiness_probe_present",
        label: "Missing readinessProbe",
        keywords: ["readiness", "readinessprobe", "probe", "ready"],
        explanation: "Without a readiness probe, traffic may hit pods that aren't ready.",
        recommendation: "Add a readinessProbe appropriate for the workload.",
      },
      {
        id: "single_replica",
        label: "Single replica in production",
        keywords: ["replica", "replicas", "single", "ha", "availability", "one"],
        explanation: "A single replica means no high availability during updates or node loss.",
        recommendation: "Use at least 2 replicas for production workloads.",
      },
    ],
  },
  {
    id: "review-intermediate-deploy-labels-001",
    title: "Deployment label / selector mismatch",
    description:
      "Pods are not being created correctly. Find the label/selector issues.",
    mode: "review",
    difficulty: "intermediate",
    expectedKinds: ["Deployment"],
    requirements: {
      requiredFields: [],
      expectedValues: [],
      requiredBestPractices: [],
    },
    scoringWeights: {
      correctness: 0.55,
      completeness: 0.1,
      best_practice: 0.25,
      interview_readiness: 0.1,
    },
    hints: ["Deployment selector must match template metadata.labels"],
    learningObjectives: ["Debug Deployment selector vs template labels"],
    tags: ["deployment", "labels"],
    solutionYaml: "",
    brokenManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
      tier: frontend
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.27
          ports:
            - containerPort: 80
`,
    reviewFindings: [
      {
        id: "label_selector_mismatch",
        label: "Selector has extra label not on pod template",
        keywords: ["selector", "tier", "label", "matchlabels", "template", "mismatch"],
        explanation:
          "spec.selector.matchLabels includes tier: frontend but the pod template only has app: web.",
        recommendation:
          "Ensure spec.selector.matchLabels is a subset of spec.template.metadata.labels.",
      },
    ],
  },
  {
    id: "review-beginner-missing-resources-001",
    title: "Missing resource requests and limits",
    description:
      "This workload causes noisy-neighbor issues on the cluster. What's missing?",
    mode: "review",
    difficulty: "beginner",
    expectedKinds: ["Deployment"],
    requirements: {
      requiredFields: [],
      expectedValues: [],
      requiredBestPractices: [],
    },
    scoringWeights: {
      correctness: 0.3,
      completeness: 0.1,
      best_practice: 0.5,
      interview_readiness: 0.1,
    },
    hints: ["Look at resources under the container spec"],
    learningObjectives: ["Understand why requests and limits matter"],
    tags: ["resources", "best-practice"],
    solutionYaml: "",
    brokenManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker
spec:
  replicas: 2
  selector:
    matchLabels:
      app: worker
  template:
    metadata:
      labels:
        app: worker
    spec:
      containers:
        - name: worker
          image: worker:2.1.0
          ports:
            - containerPort: 3000
`,
    reviewFindings: [
      {
        id: "resource_requests_present",
        label: "Missing resource requests",
        keywords: ["request", "requests", "cpu", "memory", "resources"],
        explanation: "Without requests, the scheduler cannot place pods reliably and HPA won't work.",
        recommendation: "Set resources.requests.cpu and resources.requests.memory.",
      },
      {
        id: "resource_limits_present",
        label: "Missing resource limits",
        keywords: ["limit", "limits", "cpu", "memory", "noisy", "oom"],
        explanation: "Without limits, a container can consume all node resources.",
        recommendation: "Set resources.limits.cpu and resources.limits.memory.",
      },
    ],
  },
];
