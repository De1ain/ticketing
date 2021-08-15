# Second Microserives project - ticketing app

### Tools used:

1. Docker
2. Kubernetes
3. Minikube
4. NGINX Ingress Controller
5. VirtualBox - required for ingress load balancer
6. Skaffold - watches for changes in Kubernetes config yaml files
   Skaffold version - original: 1.21.0. Updated to 1.28.1

---

### Kubernetes notes(Minikube Users):

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
cd Learning/MicroservicesUdemyCourse/ticketing/ && minikube start && minikube addons enable ingress
&& skaffold dev
minikube start --memory '8g' (currently driver is set to VirtualBox) (or [minikube start --driver=virtualbox]). To verify minikube driver, run: minikube profile list
minikube addons enable ingress - run this when a minikube is deleted and created anew
skaffold dev
!!! eval $(minikube docker-env) - not sure is this line is still needed when building with docker

Additional commands:
minikube config set cpus 4
minikube config set memory 16384

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

If you are using a vm driver, you will need to tell Kubernetes to use the Docker daemon running inside of the single node cluster instead of the host.

Run the following command:
eval $(minikube docker-env)
Note - This command will need to be repeated anytime you close and restart the terminal session.

Afterward, you can build your image:
docker build -t USERNAME/REPO .

Update, your pod manifest as shown above and then run:
kubectl apply -f infra/k8s/

https://minikube.sigs.k8s.io/docs/commands/docker-env/

---

### Minikube commands (Minikube - is a local Kubernetes runner):

0. minikube dashboard - enables minikube dashboard.
1. minikube start - run it after machine restart to start the minikube.
2. eval $(minikube docker-env) - run it after machine restart
3. minikube ip - prints out the address from which we can access the running containers
4. minikube addons enable ingress - to enable ingress-nginx
5. minikube profile list - display which driver minikube is using.
   These files contain minikube configs:
   ~/.minikube/profiles/minikube/config.json
   ~/.minikube/machines/minikube/config.json
6. minikube config view - will display something if "set" was ever used, oterwise won't show anything
7. minikube delete - to delete minikube cluster
8. minikube start --memory '8g' - by default it's 2GB, and it wasn't enought to run npm install on a client pod.
9. ??? minikube tunnl

---

### Docker commands:

3. docker ps (docker ps --all) - List all containers
4. docker build -t de1ain/servicename:0.0.1 .
5. docker create [container_name]
6. docker start -a de1ain/servicename
   docker start -a [container_id]
7. docker run -it de1ain/servicename
   docker run [container_id]
8. docker exec -it [running_container_id] sh
9. docker logs [container_id]

- Docker login credentials in /home/tim/.docker/config.json

---

### Kubernetes Pods commands:

1. kubectl get pods - print info about all the running pods
2. kubectl exec -it [podname] [cmd] - executes the given command in a running pod, i.e.: sh
   Example: kubectl exec -it posts sh
3. kubectl logs [podname] - prints out logs for the given pod
   Example: kubectl logs posts
4. kubectl delete pod [podname] - deletes the given pod
   Example: kubectl delete posts
5. kubectl apply -f [config_file_name] - tells kubernetes to process the config
   Example: kubectl apply -f posts.yaml
6. kubectl describe pod [podname] - print some info about the ruinning pod
   Example: kubectl describe pod posts
7.  kubectl get nodes - on local usually only 1. on Digital Ocean - 3.

### Kubernetes Deployments commands:

1. kubectl get deployments
2. kubectl describe deployment [depl_name] - Print out details about a specific deployment
3. kubectl describe pod [pod_name] - Print out details about a specific pod
4. k apply -f [config_file_name] - creates a deployment out of a config file
5. k delete deployment [depl_name]
6. k rollout restart deployment [depl_name]

### Updating the image used by a Deployment:

1. The deployment must use the 'latest' tag in the pod spec section
2. Make an update to your code
3. Build the image
4. Push the image to docker hub
5. Run the command: kubectl rollout restart deployment [depl_name]

### Kubernetes Services commands:

1. kubectl get services
2. k describe service posts-srv - prints out data about the Service

### Kubernetes other commands:

1. k config get-contexts - to see all contexts - local or google cloud
   after deploying to Digital Ocean, there are 2 contexts now - minikube and do-fra1-ticketing
2. k config use-context $CONTEXT_NAME - switch between different contexts
3. kubectl config view
4. kubectl create secret generic jwt-secret --from-literal=JWT_KEY=thesecretphrase
5. kubectl get secrets
6. k delete secret [secret_name]
7. k get secret/jwt-secret -o json - 'jwt-secret' is the secret name. It will show the value encoded in base64. decode it to see the actual value.
8. k delete pod [pod_name] - delete pod in order to restart it. Might be useful for client (that is using Next).
9. k port-forward nats-depl-64f8f5fd4-ph6kf 4222:4222 - forward ports from ur local machine to the pod port (for temporary copnnections). Run this command inside nats project folder.
10. To see the database contents from command line:
    k exec -it orders-mongo-depl-7655579d4f-zn97h mongo
    show dbs - to see all existing databases
    use orders - use database called orders
    db.tickets
    db.tickets.find({ price: 111 }) - find all the tickets with specified price of '111'
11. kubectl config unset contexts

---

### The entire process in order to access your service in browser:

(For development purposes we used Service of kind NodePort)

1. Create your service (write code)
2. Build a docker image - "docker build -t de1ain/posts ." Don't mention the version number, by default it's latest
3. Push to docker hub - "docker push de1ain/[container-name]"
4. Create a Deployment - posts-depl.yaml and run "kubectl apply -f posts-depl.yaml"
5. Create a Service (of type NodePort) - posts-srv.yaml and run "kubectl apply -f posts-srv.yaml"
6. Make sure to apply Service, and check on which port it runs, or run "kubectl describe service posts-srv" or "k get services"
7. Get minikube ip - run command "minikube ip"
8. The url should look like this: http://192.168.99.101:32146/posts
   The ip changes after machine restart, get the new it by running "minikube ip"
9. Client requests are sent to posts.com. posts.com is defined in hosts file (etc/hosts) as follows: "192.168.99.101 posts.com" (the ip is minikube's ip)

---

### Adding more services:

!!! OUTDATED

1. For "comments", "query", moderation"...
2. Update the URL's in each to reach out ot he "event-bus-srv"
3. Build image + push to docker hub
4. Create a deployment + clusterip service for each
5. Update the event-bus to once again send events to "comments", "query" and moderation"

!!! OUTDATED

---

### Skaffold commands:

1. skaffold dev
2. skaffold version
3. skaffold delete

---

### General notes:

1. In "ingress-srv.yaml" file, there's a line: "- path: /". For our super simple client side it is ok. But for a more complex use regex: "/?(.\*)".
   This line has to be at the end.
2. The project also uses Skaffold - Skaffold is a command line tool that facilitates continuous development for Kubernetes-native applications.
3. When opening a URL like 'https://ticketing.dev/api/users/currentuser' and there's a warning "Connection is not private...", click somewhere on the page and type "thisisunsafe" and the page will reload and display your content.
4. common module can be found here - https://www.npmjs.com/package/@ticketing-microservices-common/common

---

### Using Google Cloud:

1. Enable google Cloud Build (on the web)
2. Update the skaffold.yaml file ot use Google Cloud Build
3. Setup ingress-nginx on google cloud cluster kubernetes.github.io/ingress-nginx
4. Update the hosts file again to point to the remote cluster - to get the IP go to web client - Network Services -> Load Balancing
5. Restart skaffold

---

### NATS Streaming Server

0. Docs - https://docs.nats.io/nats-streaming-concepts/intro
1. http://localhost:8222/streaming - stats about our streaming server
2. http://localhost:8222/streaming/channelsz?subs=1 - more data on channels
3. k port-forward nats-depl-64f8f5fd4-ph6kf 4222:4222 - forward ports from ur local machine to the pod port (for temporary copnnections). Run this command inside nats project folder.

---

### Payments service:

Uses Stripe API.
Stripe docs: https://stripe.com/docs/api (charges: https://stripe.com/docs/api/charges)
The key found here: https://dashboard.stripe.com/test/apikeys
To create a Stripe secret, run this command: kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=theKeyFromAccount

---

### Secrets:

To see all existing secrets, run: k get secrets.

List of all secrets tha tshould be defined:

1. kubectl create secret generic jwt-secret --from-literal=JWT_KEY=SECRET_HERE
2. kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=theKeyFromAccount

---

### Notes:

1. Login into google cloud from terminal: gcloud auth application-default login
2. Each pod should contain secret keys - k create secret generic jwt-secret --from-literal=JWT_KEY=thisisasecretphrase
3. Instructions on how to expose ingress-nginx service inside namespace kube-system:

   check minikube config: cat ~/.minikube/config/config.json

   minikube delete

   minikube config set cpus 4
   minikube config set memory 8192
   or
   minikube config set memory 16384
   minikube config get cpus
   minikube config get memory

   minikube start

   ??? eval $(minikube docker-env)

   minikube ip (and add ip to etc/hosts)
   minikube addons enable ingress

   minikube profile list (vm driver should be VirtualBox)

   kubectl create secret generic jwt-secret --from-literal=JWT_KEY=SECRET_HERE
   kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=secretKeyFromAccount

   (kubectl get pods -n kube-system)

   kubectl get services -n kube-system
   kubectl expose deployment ingress-nginx-controller --target-port=80 --type=ClusterIP -n kube-system
   kubectl get services -n kube-system

   skaffold dev

4. systemctl status docker - to check on docker status (should be active, running)

---

GitHub actions

for each service that has tests, on every push, tests are run.
It also has to specify the env vars that exist on the machine (need to create secrets on github).
Below are the workflow scripts:

name: tests-auth
on:
  pull_request
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      JWT_KEY: ${{ secrets.JWT_KEY }}
    steps:
      - uses: actions/checkout@v2
      - run: cd auth && npm install && npm run test:ci

---

### TODO:

1. Eliminate the need in .env files?...
2. Make use of convertPriceToCents in test file for new route handler as well.
3. Extract default 60 seconds pay timeout from orders/new.ts
4. Exctract stripe publishable key from [orderId].js