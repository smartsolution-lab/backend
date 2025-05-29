const { initializeApp , cert,} = require('firebase-admin/app')
const {getAuth} = require('firebase-admin/auth')
import serviceAccount from './firebase.json'

const firebaseAdmin = initializeApp({
    credential: cert(serviceAccount),
})
export default firebaseAdmin
