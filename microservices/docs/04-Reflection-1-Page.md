# Deliverable: Reflection (1 Page)

## Which architecture do I prefer and why?

After building both versions of the Student Course System, I can clearly see the strengths and trade-offs of each architecture. If I must choose one architecture for this project at its current scale, I prefer the monolithic approach for speed and simplicity. If I choose for long-term growth and maintainability, I prefer microservices.

The monolithic system is easier to build, test, and run. There is only one application process and one place to debug. During development, this helped me move quickly because I did not need to coordinate multiple services or manage communication errors between them. For students learning architecture for the first time, monolithic design is usually less stressful and easier to understand end-to-end.

However, while implementing microservices, I learned why many real organizations use them. Service boundaries force cleaner responsibilities: Student Service handles students, Course Service handles courses, and Enrollment Service handles enrollment rules. This separation improves modularity and ownership. It also enables independent scaling. For example, if enrollment traffic increases, I can scale only Enrollment Service instead of scaling the whole system.

I also noticed that microservices introduce operational complexity. I had to run multiple ports, configure service URLs, manage CORS for browser communication, and handle failure cases when one service is unavailable. These are important real-world concerns, but they increase implementation overhead. Inter-service communication also adds network latency compared to direct in-process calls in a monolith.

In terms of reliability, microservices can reduce blast radius when failures are isolated properly. A bug in one service does not automatically crash every feature. But this benefit depends on careful error handling and resilience patterns. Without those safeguards, distributed failures can still cascade.

Overall, my preferred architecture depends on project context. For small academic projects or early-stage products, I prefer monolithic because it delivers value faster with lower complexity. For larger systems that need team autonomy, independent deployments, and targeted scalability, I prefer microservices despite the added complexity. This lab helped me understand that architecture is not about choosing one "best" style universally. The better architecture is the one that matches system scale, team capability, and long-term goals.
