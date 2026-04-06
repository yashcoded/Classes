# How to use AWS (beginner-friendly guide)

This guide explains AWS in simple steps: where to go, what to click, and how to find the places where you set your app’s keys. If you’ve never used AWS before, start here.

---

## 1. What is AWS?

Think of AWS (Amazon Web Services) as a big building where you can rent “rooms” to run your app.  
You don’t own the servers — AWS runs them for you. You use a website called the **AWS Console** to turn things on, set passwords (like `JWT_SECRET`), and see the address (URL) of your app.

---

## 2. Sign in to the AWS Console

1. Open your browser and go to: **https://console.aws.amazon.com**
2. Sign in with the email and password (or root/user) your team or you use for AWS.
3. After login you see the **AWS Console** — a page with a search bar at the top and a list of services on the left (or in the “Services” menu).

**Tip:** If someone gave you a “link to the console,” it might look like  
`https://123456789012.signin.aws.amazon.com/console` — that’s just another way to get to the same place.

---

## 3. The main things you need to know

### The search bar (top of the page)

- At the very top there’s a **search box** that says something like “Search for services, features, guides…”
- You can type the name of what you want (e.g. **Elastic Beanstalk**, **Lambda**, **App Runner**) and press Enter. AWS will show you that service so you don’t have to hunt in menus.

### Region (top-right, next to your name)

- There’s a **region** name (e.g. **N. Virginia (us-east-1)** or **Mumbai (ap-south-1)**).
- Your app and its keys live in **one region**. If you created your app in **N. Virginia**, stay in N. Virginia when you look for it. Changing the region is like changing the building — your app won’t be in a different building.

### Services

- **Services** are the “rooms” we talked about: Elastic Beanstalk, App Runner, Lambda, EC2, ECS, etc. Each one runs your code in a slightly different way.
- You only need to learn the **one** service you’re using (e.g. only Elastic Beanstalk, or only App Runner).

---

## 4. How to find where to set your keys (environment variables)

Your keys (like `JWT_SECRET`, `QR_SECRET`) are called **environment variables** in AWS. You type their names and values in the right place so your app can read them when it runs.

**Don’t have the secret values yet?** See **[How to generate JWT_SECRET and QR_SECRET](GENERATE_SECRETS.md)** for step-by-step generation (PowerShell, Node, OpenSSL, online) and references.

Below is **where to click** for each common service. Pick the one you use.

---

### Option A: Elastic Beanstalk (running a Node app in a “container”)

**What it is:** AWS runs your Node app and gives you a URL. Good for a backend like ours.

**First time creating Elastic Beanstalk?** Use the full walkthrough: **[Elastic Beanstalk from scratch](ELASTIC_BEANSTALK.md)** (region e.g. Mumbai `ap-south-1`, Docker upload, environment properties, health check).

**How to get there (after the environment exists):**

1. In the **search bar at the top**, type **Elastic Beanstalk** and open **Elastic Beanstalk**.
2. On the left you’ll see **Environments**. Click it.
3. Click the **name of your environment** (e.g. “ClassesBackend-env”). That opens the page for that environment.
4. In the **left sidebar**, click **Configuration**.
5. In the main area you’ll see boxes (e.g. “Updates, monitoring, and logging”). Find the one that says **Software** or **Edit** next to it — click **Edit**.
6. Scroll down to **Environment properties**. There you’ll see a list: **Key** and **Value**.
7. Click **Add environment property** and add one row per key, for example:
   - Key: `JWT_SECRET`   → Value: (paste your secret)
   - Key: `QR_SECRET`   → Value: (paste your secret)
   - Key: `PORT`       → Value: `3000` (if you need it)
   - Key: `JWT_EXPIRES_IN` → Value: `7d` (optional)
8. Click **Apply** at the bottom. AWS will restart your app with the new keys.

**Where to find your app’s URL:**  
On the same environment page, at the top you’ll see a link like `ClassesBackend-env.xxxx.us-east-1.elasticbeanstalk.com`. That’s your backend URL. For the API you add `/api/v1`, so: `https://ClassesBackend-env.xxxx.us-east-1.elasticbeanstalk.com/api/v1`.

---

### Option B: App Runner (simple “run my container” service)

**What it is:** You give AWS a container image; it runs it and gives you a URL. Very simple.

**How to get there:**

1. In the **search bar**, type **App Runner** and open **App Runner**.
2. You’ll see a list of **Services**. Click the **name of your service** (e.g. “classes-backend”).
3. Open the **Configuration** tab (or the **Service** overview). Look for **Environment variables** or **Configuration**.
4. Click **Edit** or **Add environment variable**. Add:
   - `JWT_SECRET` = (your secret)
   - `QR_SECRET` = (your secret)
   - `PORT` = `3000` (if needed)
   - `JWT_EXPIRES_IN` = `7d` (optional)
5. Save. App Runner will redeploy with the new values.

**Where to find your app’s URL:**  
On the same service page you’ll see **Default domain** or **Service URL** (e.g. `xxxxx.us-east-1.awsapprunner.com`). Your API base URL is that + `/api/v1`, e.g. `https://xxxxx.us-east-1.awsapprunner.com/api/v1`.

---

### Option C: Lambda (running a single function, no server always on)

**What it is:** Your code runs only when someone calls it. You don’t set PORT the same way; you set env vars for the function.

**How to get there:**

1. In the **search bar**, type **Lambda** and open **Lambda**.
2. Click **Functions** in the left sidebar.
3. Click the **name of your function** (e.g. “classes-api”).
4. Scroll to the **Configuration** tab (or the **Environment variables** section on the same page).
5. Click **Edit** (next to Environment variables), then **Add environment variable**. Add:
   - Key: `JWT_SECRET`, Value: (your secret)
   - Key: `QR_SECRET`, Value: (your secret)
   - Key: `JWT_EXPIRES_IN`, Value: `7d` (optional)
6. Click **Save**.

**Where to find your app’s URL:**  
You usually put an **API Gateway** in front of Lambda. In the search bar open **API Gateway**, click your API, then **Stages** → click a stage (e.g. “prod”). You’ll see **Invoke URL**. That’s your base; add `/api/v1` or whatever path your app uses.

---

### Option D: ECS (Fargate) (running Docker containers)

**What it is:** You run a “task” (often one container). Env vars can be set on the task definition.

**How to get there:**

1. In the **search bar**, type **ECS** and open **Elastic Container Service**.
2. In the left sidebar click **Task Definitions**. Click the **name** of your task definition (e.g. “classes-backend”), then the **revision** (e.g. “classes-backend:1”).
3. Scroll to **Container definitions** and click the **container name** (e.g. “backend”).
4. Scroll to **Environment variables** (or **Secrets** if you use Secrets Manager). Click **Add environment variable** and add:
   - `JWT_SECRET`, `QR_SECRET`, `PORT`, `JWT_EXPIRES_IN`
5. Save. Create a **new revision** of the task definition if asked, then **update your ECS service** to use that new revision so the running app gets the new keys.

**Where to find your app’s URL:**  
It’s usually the address of a **Load Balancer** (ALB) or **API Gateway** in front of ECS. In the left sidebar open **Load Balancing** → **Load Balancers**, click your ALB, and check **DNS name**. Or in **API Gateway** → your API → **Stages** → **Invoke URL**. Use that + `/api/v1` as your backend URL.

---

### Option E: EC2 (your own virtual machine)

**What it is:** You have a Linux (or Windows) machine in the cloud. You install Node and run your app yourself. Keys can live in a file on the machine (e.g. `.env`) or in AWS and then loaded by your app.

**How to get there:**

1. In the **search bar**, type **EC2** and open **EC2**.
2. In the left sidebar click **Instances**. Click the **Instance ID** of your server.
3. To **log in** to the machine: use **Connect** (top right) → **Session Manager** (or **EC2 Instance Connect**), then click **Connect**. A terminal opens in the browser.
4. On that machine you can create a file like `backend/.env` and put your keys there (same format as local: `JWT_SECRET=xxx`). Or you can use **SSM Parameter Store** to store secrets and have your app read them when it starts — that’s more advanced; see [SETUP_KEYS.md](SETUP_KEYS.md) for links.

**Where to find your app’s URL:**  
It’s the **Public IP** or **Public DNS** of the EC2 instance (you see it on the instance details page). If you put a load balancer or domain in front, use that URL instead. Your API base is that URL + `:3000/api/v1` (or whatever port your app uses).

---

## 5. Quick recap

| I use…            | Where to set keys                          | Where to find my backend URL                    |
|-------------------|--------------------------------------------|------------------------------------------------|
| Elastic Beanstalk | Environment → Configuration → Software → Environment properties | Environment page top: environment URL + `/api/v1` |
| App Runner        | Service → Configuration → Environment variables | Service page: Default domain + `/api/v1`       |
| Lambda            | Function → Configuration → Environment variables | API Gateway → Stages → Invoke URL + path       |
| ECS (Fargate)     | Task Definition → Container → Environment variables | ALB DNS or API Gateway Invoke URL + `/api/v1`  |
| EC2               | On the machine (e.g. `.env` file) or SSM   | EC2 instance Public IP/DNS + `:3000/api/v1`    |

---

## 6. If you get lost

- **Search bar:** Type the service name (Elastic Beanstalk, Lambda, etc.) and open the first result.
- **Region:** Make sure the region (top-right) is the one where you created your app.
- **Support:** AWS has a [documentation](https://docs.aws.amazon.com/) site; each service has a “Getting started” or “User guide” with more detail.

Once you know **which** service you’re using, you only need to remember: **find that service → open your app/environment/function → find “Environment variables” or “Configuration” → add your keys there.**
