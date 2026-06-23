import type { Exercise, ScoringWeights } from "../domain/types";

const DEBUG_BEGINNER: ScoringWeights = {
  correctness: 0.55,
  completeness: 0.3,
  best_practice: 0.05,
  interview_readiness: 0.1,
};

export const debugExercises: Exercise[] = [
  {
    id: "debug-beginner-deployment-structure-001",
    title: "Broken Deployment structure",
    description:
      "This Deployment was copied from a runbook with bad indentation and incomplete fields. Fix the manifest so it would actually schedule pods.",
    mode: "debug",
    difficulty: "beginner",
    expectedKinds: ["Deployment"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "nginx", description: "name" },
        { path: "spec.replicas", value: 3, description: "replicas" },
        {
          path: "spec.template.spec.containers[0].image",
          value: "nginx:1.27",
          description: "image",
        },
        {
          path: "spec.template.spec.containers[0].ports[0].containerPort",
          value: 80,
          description: "port",
        },
      ],
      expectedValues: [
        {
          path: "spec.selector.matchLabels.app",
          equals: "nginx",
          description: "selector label",
        },
        {
          path: "spec.template.metadata.labels.app",
          equals: "nginx",
          description: "template label",
        },
      ],
      requiredBestPractices: [],
    },
    scoringWeights: DEBUG_BEGINNER,
    hints: [
      "Check YAML indentation under spec — child keys must be nested correctly",
      "selector.matchLabels must match template.metadata.labels",
      "A Deployment needs metadata.name, replicas, and a container spec",
    ],
    learningObjectives: [
      "Spot structural YAML indentation errors",
      "Fix selector / template label mismatches",
      "Restore missing Deployment fields",
    ],
    tags: ["deployment", "indentation", "labels"],
    brokenManifest: `apiVersion: apps/v1
kind: Deployment

spec:
selector:
matchLabels:
app: nginx

template:
metadata:
labels:
app: web
`,
    solutionYaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
`,
    debugFindings: [
      {
        id: "missing_metadata",
        label: "Missing metadata.name",
        keywords: ["metadata", "name"],
        explanation: "Every namespaced resource needs metadata.name so it can be referenced.",
        recommendation: "Add metadata.name: nginx",
      },
      {
        id: "bad_indentation",
        label: "Incorrect YAML indentation under spec",
        keywords: ["indent", "indentation", "structure"],
        explanation:
          "selector, matchLabels, and template must be nested under spec with consistent spacing.",
        recommendation: "Indent child keys two spaces under their parent.",
      },
      {
        id: "label_mismatch",
        label: "Selector labels do not match pod template labels",
        keywords: ["selector", "label", "nginx", "web", "mismatch"],
        explanation:
          "spec.selector.matchLabels.app is nginx but template labels use app: web — no pods would match.",
        recommendation: "Align template.metadata.labels.app with spec.selector.matchLabels.app.",
      },
      {
        id: "missing_container",
        label: "No container spec defined",
        keywords: ["container", "image", "replicas"],
        explanation: "The manifest has no replicas, containers, image, or ports.",
        recommendation: "Add replicas, containers, image, and containerPort.",
      },
    ],
  },
  {
    id: "debug-beginner-service-selector-001",
    title: "Service with wrong selector",
    description:
      "Pods are running but this Service receives no traffic. Fix the manifest so it routes to the correct workloads.",
    mode: "debug",
    difficulty: "beginner",
    expectedKinds: ["Service"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "web-svc", description: "name" },
        { path: "spec.ports[0].port", value: 80, description: "port" },
        { path: "spec.ports[0].targetPort", value: 80, description: "targetPort" },
      ],
      expectedValues: [
        { path: "spec.selector.app", equals: "web", description: "selector" },
      ],
      requiredBestPractices: [],
    },
    scoringWeights: DEBUG_BEGINNER,
    hints: [
      "Compare spec.selector with the Pod labels you expect to target",
      "targetPort must match the port the container listens on",
    ],
    learningObjectives: [
      "Debug Service → Pod routing via selectors",
      "Fix targetPort mismatches",
    ],
    tags: ["service", "selector"],
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
    solutionYaml: `apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
`,
    debugFindings: [
      {
        id: "svc_selector_mismatch",
        label: "Service selector does not match Pod labels",
        keywords: ["selector", "label", "frontend", "web"],
        explanation: "Pods are labeled app=web but the Service selects app=frontend.",
        recommendation: "Set spec.selector.app to web.",
      },
      {
        id: "target_port_mismatch",
        label: "targetPort does not match container port",
        keywords: ["targetport", "8080", "port 80"],
        explanation: "targetPort 8080 does not match a container listening on port 80.",
        recommendation: "Set targetPort to 80.",
      },
    ],
  },
  {
    id: "debug-intermediate-deployment-probes-001",
    title: "Production Deployment anti-patterns",
    description:
      "This Deployment was rushed into production. Fix correctness issues and obvious operational problems.",
    mode: "debug",
    difficulty: "intermediate",
    expectedKinds: ["Deployment"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "api", description: "name" },
        {
          path: "spec.template.spec.containers[0].image",
          value: "nginx:1.27",
          description: "pinned image",
        },
      ],
      expectedValues: [
        {
          path: "spec.selector.matchLabels.app",
          equals: "api",
          description: "selector label",
        },
        {
          path: "spec.template.metadata.labels.app",
          equals: "api",
          description: "template label",
        },
      ],
      requiredBestPractices: ["readiness_probe_present", "resource_requests_present"],
    },
    scoringWeights: {
      correctness: 0.4,
      completeness: 0.2,
      best_practice: 0.3,
      interview_readiness: 0.1,
    },
    hints: [
      "Avoid floating :latest tags in production",
      "Add readiness probes and resource requests",
    ],
    learningObjectives: [
      "Replace unpinned image tags",
      "Add probes and resource requests for production readiness",
    ],
    tags: ["deployment", "best-practice"],
    brokenManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
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
          image: nginx:latest
          ports:
            - containerPort: 80
`,
    solutionYaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
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
          image: nginx:1.27
          ports:
            - containerPort: 80
          readinessProbe:
            httpGet:
              path: /
              port: 80
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
`,
    debugFindings: [
      {
        id: "image_latest",
        label: "Unpinned :latest image tag",
        keywords: ["latest", "image", "tag", "pin"],
        explanation: ":latest is mutable and makes rollbacks unpredictable.",
        recommendation: "Pin to a specific version such as nginx:1.27.",
      },
      {
        id: "no_readiness_probe",
        label: "Missing readiness probe",
        keywords: ["readiness", "probe", "health"],
        explanation: "Without a readiness probe, traffic may reach pods that are not ready.",
        recommendation: "Add an httpGet readinessProbe on the container port.",
      },
      {
        id: "no_resource_requests",
        label: "Missing resource requests",
        keywords: ["resource", "request", "cpu", "memory"],
        explanation: "Missing requests prevent the scheduler from placing pods reliably.",
        recommendation: "Set resources.requests for CPU and memory.",
      },
    ],
  },
];
