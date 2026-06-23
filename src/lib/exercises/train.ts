import type { Exercise, ScoringWeights } from "../domain/types";

const BEGINNER: ScoringWeights = {
  correctness: 0.5,
  completeness: 0.3,
  best_practice: 0.1,
  interview_readiness: 0.1,
};

const INTERMEDIATE: ScoringWeights = {
  correctness: 0.45,
  completeness: 0.3,
  best_practice: 0.15,
  interview_readiness: 0.1,
};

const ADVANCED: ScoringWeights = {
  correctness: 0.4,
  completeness: 0.25,
  best_practice: 0.25,
  interview_readiness: 0.1,
};

export const trainExercises: Exercise[] = [
  {
    id: "train-beginner-deployment-nginx-001",
    title: "Create an nginx Deployment",
    description:
      "Create a Deployment named `nginx` running `nginx:1.27` with 3 replicas exposing port 80.",
    mode: "train",
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
    scoringWeights: {
      correctness: 0.4,
      completeness: 0.25,
      best_practice: 0.25,
      interview_readiness: 0.1,
    },
    hints: [
      "Selector labels must match template labels",
      "Production Deployments typically include readiness probes",
    ],
    learningObjectives: [
      "Understand Deployment spec structure",
      "Configure replica count and container ports",
      "Apply label/selector consistency",
    ],
    tags: ["deployment", "nginx"],
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
  },
  {
    id: "train-beginner-pod-nginx-001",
    title: "Create a simple nginx Pod",
    description: "Create a Pod named `nginx-pod` using image `nginx:1.27`.",
    mode: "train",
    difficulty: "beginner",
    expectedKinds: ["Pod"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "nginx-pod", description: "name" },
        { path: "spec.containers[0].name", value: "nginx", description: "container name" },
        { path: "spec.containers[0].image", value: "nginx:1.27", description: "image" },
      ],
      expectedValues: [],
      requiredBestPractices: [],
    },
    scoringWeights: BEGINNER,
    hints: ["A Pod is the smallest deployable unit in Kubernetes"],
    learningObjectives: ["Understand basic Pod structure"],
    tags: ["pod"],
    solutionYaml: `apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
    - name: nginx
      image: nginx:1.27
`,
  },
  {
    id: "train-beginner-service-nginx-001",
    title: "Create a ClusterIP Service",
    description:
      "Create a Service named `nginx-svc` selecting `app=nginx`, port 80 → targetPort 80.",
    mode: "train",
    difficulty: "beginner",
    expectedKinds: ["Service"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "nginx-svc", description: "name" },
        { path: "spec.type", value: "ClusterIP", description: "service type" },
        { path: "spec.ports[0].port", value: 80, description: "service port" },
        { path: "spec.ports[0].targetPort", value: 80, description: "target port" },
      ],
      expectedValues: [
        { path: "spec.selector.app", equals: "nginx", description: "selector" },
      ],
      requiredBestPractices: [],
    },
    scoringWeights: {
      correctness: 0.45,
      completeness: 0.3,
      best_practice: 0.15,
      interview_readiness: 0.1,
    },
    hints: ["Service selector must match Pod labels"],
    learningObjectives: ["Configure Service selectors and ports"],
    tags: ["service"],
    solutionYaml: `apiVersion: v1
kind: Service
metadata:
  name: nginx-svc
spec:
  type: ClusterIP
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
`,
  },
  {
    id: "train-beginner-service-nodeport-001",
    title: "Create a NodePort Service",
    description:
      "Create a NodePort Service named `web-nodeport` for `app=web` on port 80 with `nodePort` 30080.",
    mode: "train",
    difficulty: "beginner",
    expectedKinds: ["Service"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "web-nodeport", description: "name" },
        { path: "spec.type", value: "NodePort", description: "service type" },
        { path: "spec.ports[0].port", value: 80, description: "service port" },
        { path: "spec.ports[0].nodePort", value: 30080, description: "node port" },
      ],
      expectedValues: [
        { path: "spec.selector.app", equals: "web", description: "selector" },
      ],
      requiredBestPractices: [],
    },
    scoringWeights: BEGINNER,
    hints: ["NodePort exposes the Service on each node's IP at a static port"],
    learningObjectives: ["Expose workloads outside the cluster with NodePort"],
    tags: ["service", "nodeport"],
    solutionYaml: `apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
`,
  },
  {
    id: "train-beginner-pod-resources-001",
    title: "Pod with resource requests",
    description:
      "Create a Pod named `api-pod` running `nginx:1.27` with CPU request `100m` and memory request `64Mi`.",
    mode: "train",
    difficulty: "beginner",
    expectedKinds: ["Pod"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "api-pod", description: "name" },
        { path: "spec.containers[0].image", value: "nginx:1.27", description: "image" },
        {
          path: "spec.containers[0].resources.requests.cpu",
          value: "100m",
          description: "CPU request",
        },
        {
          path: "spec.containers[0].resources.requests.memory",
          value: "64Mi",
          description: "memory request",
        },
      ],
      expectedValues: [],
      requiredBestPractices: [],
    },
    scoringWeights: BEGINNER,
    hints: ["Resource requests live under spec.containers[].resources.requests"],
    learningObjectives: ["Set container resource requests"],
    tags: ["pod", "resources"],
    solutionYaml: `apiVersion: v1
kind: Pod
metadata:
  name: api-pod
spec:
  containers:
    - name: api
      image: nginx:1.27
      resources:
        requests:
          cpu: 100m
          memory: 64Mi
`,
  },
  {
    id: "train-beginner-configmap-001",
    title: "Create a ConfigMap",
    description: "Create a ConfigMap named `app-config` with key `LOG_LEVEL` set to `info`.",
    mode: "train",
    difficulty: "beginner",
    expectedKinds: ["ConfigMap"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "app-config", description: "name" },
        { path: "data.LOG_LEVEL", value: "info", description: "LOG_LEVEL" },
      ],
      expectedValues: [],
      requiredBestPractices: [],
    },
    scoringWeights: {
      correctness: 0.55,
      completeness: 0.3,
      best_practice: 0.05,
      interview_readiness: 0.1,
    },
    hints: [],
    learningObjectives: ["Understand ConfigMap data structure"],
    tags: ["configmap"],
    solutionYaml: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: info
`,
  },
  {
    id: "train-beginner-secret-001",
    title: "Create a Secret",
    description:
      "Create an Opaque Secret named `db-credentials` with `password: s3cr3t` (use stringData).",
    mode: "train",
    difficulty: "beginner",
    expectedKinds: ["Secret"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "db-credentials", description: "name" },
        { path: "type", value: "Opaque", description: "secret type" },
      ],
      expectedValues: [
        { path: "stringData.password", equals: "s3cr3t", description: "password value" },
      ],
      requiredBestPractices: [],
    },
    scoringWeights: {
      correctness: 0.55,
      completeness: 0.3,
      best_practice: 0.05,
      interview_readiness: 0.1,
    },
    hints: ["stringData avoids manual base64 encoding during development"],
    learningObjectives: ["Understand Secret structure"],
    tags: ["secret"],
    solutionYaml: `apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:
  password: s3cr3t
`,
  },
  {
    id: "train-intermediate-job-pi-001",
    title: "Run a one-off Job",
    description:
      "Create a Job named `pi` with `completions: 1`, `restartPolicy: Never`, running image `perl:5.34`.",
    mode: "train",
    difficulty: "intermediate",
    expectedKinds: ["Job"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "pi", description: "name" },
        { path: "spec.completions", value: 1, description: "completions" },
        {
          path: "spec.template.spec.restartPolicy",
          value: "Never",
          description: "restart policy",
        },
        {
          path: "spec.template.spec.containers[0].image",
          value: "perl:5.34",
          description: "image",
        },
      ],
      expectedValues: [],
      requiredBestPractices: [],
    },
    scoringWeights: INTERMEDIATE,
    hints: ["Jobs need a Pod template under spec.template"],
    learningObjectives: ["Create batch Jobs with a Pod template"],
    tags: ["job", "batch"],
    solutionYaml: `apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  completions: 1
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: pi
          image: perl:5.34
          command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(20)"]
`,
  },
  {
    id: "train-intermediate-pvc-001",
    title: "Request persistent storage",
    description:
      "Create a PVC named `data-pvc` with `10Gi` storage and access mode `ReadWriteOnce`.",
    mode: "train",
    difficulty: "intermediate",
    expectedKinds: ["PersistentVolumeClaim"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "data-pvc", description: "name" },
        {
          path: "spec.resources.requests.storage",
          value: "10Gi",
          description: "storage size",
        },
      ],
      expectedValues: [
        {
          path: "spec.accessModes[0]",
          equals: "ReadWriteOnce",
          description: "access mode",
        },
      ],
      requiredBestPractices: [],
    },
    scoringWeights: INTERMEDIATE,
    hints: ["Storage requests use spec.resources.requests.storage"],
    learningObjectives: ["Declare PersistentVolumeClaims"],
    tags: ["pvc", "storage"],
    solutionYaml: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
`,
  },
  {
    id: "train-intermediate-ingress-001",
    title: "Route traffic with Ingress",
    description:
      "Create an Ingress `web-ingress` for host `app.example.com`, path `/`, backend Service `web-svc` port 80.",
    mode: "train",
    difficulty: "intermediate",
    expectedKinds: ["Ingress"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "web-ingress", description: "name" },
        { path: "spec.rules[0].host", value: "app.example.com", description: "host" },
        { path: "spec.rules[0].http.paths[0].path", value: "/", description: "path" },
        {
          path: "spec.rules[0].http.paths[0].backend.service.name",
          value: "web-svc",
          description: "backend service",
        },
        {
          path: "spec.rules[0].http.paths[0].backend.service.port.number",
          value: 80,
          description: "backend port",
        },
      ],
      expectedValues: [
        {
          path: "spec.rules[0].http.paths[0].pathType",
          equals: "Prefix",
          description: "path type",
        },
      ],
      requiredBestPractices: [],
    },
    scoringWeights: INTERMEDIATE,
    hints: ["Ingress v1 uses networking.k8s.io/v1 and pathType is required"],
    learningObjectives: ["Configure HTTP Ingress rules"],
    tags: ["ingress", "networking"],
    solutionYaml: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-svc
                port:
                  number: 80
`,
  },
  {
    id: "train-intermediate-deployment-configmap-env-001",
    title: "Inject ConfigMap as env var",
    description:
      "Deployment `api` (1 replica, `app=api`) running `nginx:1.27` with env `LOG_LEVEL` from ConfigMap `app-config`.",
    mode: "train",
    difficulty: "intermediate",
    expectedKinds: ["Deployment"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "api", description: "name" },
        { path: "spec.replicas", value: 1, description: "replicas" },
        {
          path: "spec.template.spec.containers[0].image",
          value: "nginx:1.27",
          description: "image",
        },
        {
          path: "spec.template.spec.containers[0].env[0].name",
          value: "LOG_LEVEL",
          description: "env name",
        },
        {
          path: "spec.template.spec.containers[0].env[0].valueFrom.configMapKeyRef.name",
          value: "app-config",
          description: "configMap name",
        },
        {
          path: "spec.template.spec.containers[0].env[0].valueFrom.configMapKeyRef.key",
          value: "LOG_LEVEL",
          description: "configMap key",
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
      requiredBestPractices: [],
    },
    scoringWeights: INTERMEDIATE,
    hints: ["Use valueFrom.configMapKeyRef to reference a ConfigMap key"],
    learningObjectives: ["Wire ConfigMaps into container environment variables"],
    tags: ["deployment", "configmap", "env"],
    solutionYaml: `apiVersion: apps/v1
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
          image: nginx:1.27
          env:
            - name: LOG_LEVEL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: LOG_LEVEL
`,
  },
  {
    id: "train-intermediate-pod-service-multidoc-001",
    title: "Pod and Service (multi-doc)",
    description:
      "Write two YAML documents: Pod `web` (`app=web`, `nginx:1.27`) and ClusterIP Service `web` selecting `app=web` on port 80.",
    mode: "train",
    difficulty: "intermediate",
    expectedKinds: ["Pod", "Service"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "web", description: "pod name" },
        {
          path: "spec.containers[0].image",
          value: "nginx:1.27",
          description: "pod image",
        },
        { path: "metadata.name", value: "web", description: "service name" },
        { path: "spec.ports[0].port", value: 80, description: "service port" },
      ],
      expectedValues: [
        { path: "metadata.labels.app", equals: "web", description: "pod label" },
        { path: "spec.selector.app", equals: "web", description: "service selector" },
      ],
      requiredBestPractices: [],
      multiDocument: true,
    },
    scoringWeights: INTERMEDIATE,
    hints: ["Separate documents with --- on its own line"],
    learningObjectives: ["Author multi-document YAML manifests"],
    tags: ["pod", "service", "multi-doc"],
    solutionYaml: `apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  containers:
    - name: web
      image: nginx:1.27
---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
`,
  },
  {
    id: "train-advanced-statefulset-redis-001",
    title: "StatefulSet with headless service",
    description:
      "Create a StatefulSet `redis` with `serviceName: redis`, 3 replicas, label `app=redis`, image `redis:7.2`, port 6379.",
    mode: "train",
    difficulty: "advanced",
    expectedKinds: ["StatefulSet"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "redis", description: "name" },
        { path: "spec.serviceName", value: "redis", description: "service name" },
        { path: "spec.replicas", value: 3, description: "replicas" },
        {
          path: "spec.template.spec.containers[0].image",
          value: "redis:7.2",
          description: "image",
        },
        {
          path: "spec.template.spec.containers[0].ports[0].containerPort",
          value: 6379,
          description: "port",
        },
      ],
      expectedValues: [
        {
          path: "spec.selector.matchLabels.app",
          equals: "redis",
          description: "selector label",
        },
        {
          path: "spec.template.metadata.labels.app",
          equals: "redis",
          description: "template label",
        },
      ],
      requiredBestPractices: [],
    },
    scoringWeights: ADVANCED,
    hints: ["StatefulSets require a stable serviceName for pod identity"],
    learningObjectives: ["Configure StatefulSets for stateful workloads"],
    tags: ["statefulset", "redis"],
    solutionYaml: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
spec:
  serviceName: redis
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7.2
          ports:
            - containerPort: 6379
`,
  },
  {
    id: "train-advanced-cronjob-backup-001",
    title: "Scheduled CronJob",
    description:
      "Create a CronJob `backup` on schedule `0 * * * *` running `busybox:1.36` with `restartPolicy: OnFailure`.",
    mode: "train",
    difficulty: "advanced",
    expectedKinds: ["CronJob"],
    requirements: {
      requiredFields: [
        { path: "metadata.name", value: "backup", description: "name" },
        { path: "spec.schedule", value: "0 * * * *", description: "schedule" },
        {
          path: "spec.jobTemplate.spec.template.spec.restartPolicy",
          value: "OnFailure",
          description: "restart policy",
        },
        {
          path: "spec.jobTemplate.spec.template.spec.containers[0].image",
          value: "busybox:1.36",
          description: "image",
        },
      ],
      expectedValues: [],
      requiredBestPractices: [],
    },
    scoringWeights: ADVANCED,
    hints: ["CronJob pods are defined under spec.jobTemplate.spec.template"],
    learningObjectives: ["Schedule recurring work with CronJobs"],
    tags: ["cronjob", "batch"],
    solutionYaml: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup
spec:
  schedule: "0 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: busybox:1.36
              command: ["sh", "-c", "echo backup"]
`,
  },
];
