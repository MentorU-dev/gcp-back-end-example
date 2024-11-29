import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword,
} from 'firebase/auth';
import dotenv from 'dotenv';


dotenv.config();

class IdentityPlatformService {
  private auth;

  constructor() {
    const firebaseConfig = {
      apiKey: process.env.AUTH_PLATFORM_KEY,
      authDomain: process.env.AUTH_PLATFORM_DOMAIN
    };

    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
  }

  async loginUser(userInput): Promise<any> {
      const userCredential = await signInWithEmailAndPassword(this.auth, userInput.email, userInput.password);
      return userCredential.user.getIdTokenResult(true);
  }

  async createUser(email: string, password: string): Promise<string> {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user.uid;
  }
}

export default IdentityPlatformService;
