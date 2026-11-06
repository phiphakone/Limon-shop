# Firebase setup for Limon Shop

The website uses the Firebase project **limom-915b8**. Customer orders are written to the Firestore **orders** collection. Payment proofs are stored in Cloud Storage under **payment-proofs/**.

## 1. Create the Firebase services

In the Firebase Console for limom-915b8:

1. Create a Cloud Firestore database.
2. In Authentication, enable the Email/Password and Google providers, and create an admin user for **ppk.bm.30@gmail.com**. Set the password in Firebase Console; do not put it in website code.
3. In Authentication settings, add the website domain to Authorized domains. For the local preview, use **localhost**.
4. In Storage, create or enable the project's bucket.

## 2. Publish the security rules and website

From this project folder, install and sign in to Firebase CLI if needed:

    npm install -g firebase-tools
    firebase login

Then deploy the Firestore rules, Storage rules, and static website:

    firebase deploy

The rules allow customers to submit new orders and upload an image receipt up to 5 MB. Only the admin email above can read orders and payment proofs. The admin can update order and payment statuses.

## 3. Open the site

After Hosting deploys, Firebase CLI prints the public website address. The Admin page is at /admin.html.

The firebase-config.js, firestore.rules, and storage.rules files must all use the same admin email. If it changes, update all three before deploying.

The Firebase web configuration is public by design. Firestore and Storage Security Rules protect order data and receipts; do not replace them with public read/write rules. For extra protection against automated public submissions, enable Firebase App Check before advertising the site widely.
