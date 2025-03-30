import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebaseConfig";

const Login = () => {
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log(result.user);
        } catch (error) {
            console.error(error);
        }
    };

    return <button onClick={signInWithGoogle}>Sign in with Google</button>;
};

export default Login;
