# Deliverable: Monolithic vs Microservices Comparison Table

| Criteria | Monolithic | Microservices |
|---|---|---|
| Ease of Development | Easier at start because everything is in one codebase and one runtime. | Harder at start due to multiple services, ports, and inter-service calls. |
| Deployment Difficulty | Simple deployment as one application unit. | More complex deployment because each service is deployed and configured independently. |
| Scalability | Scales the entire app together, even if only one feature needs more resources. | Scales specific services independently (for example, Enrollment only). |
| Failure Impact | A major bug can affect the whole application. | Failures can be isolated to one service if boundaries are respected. |
| Performance | Faster local in-process calls between modules. | Additional network overhead from HTTP calls between services. |

## Short Analysis

For small class projects and prototypes, monolithic architecture is faster to build and easier to manage. For growing systems with separate teams and changing workloads, microservices provide better long-term flexibility and scaling control.
