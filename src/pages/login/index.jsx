import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebaseConfig";
import "./styles.css";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    function handleSignIn(e) {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password) // Chama signInWithEmailAndPassword com email e senha
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Usuário logado:", user);
                navigate("/home");
            })
            .catch((error) => {
                console.error("Erro ao fazer login:", error);
            });
    }

    return (
        <div className="container">
            <div className="container-login">
                <div className="wrap-login">
                    <form className="login-form">
                        <span className="login-form-title"> BombinhaJS </span>

                        <div className="wrap-inputt">
                            <input
                                className={email !== "" ? "has-val input" : "input"}
                                type="text"
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <span className="focus-input" data-placeholder="Email"></span>
                        </div>

                        <div className="wrap-inputt">
                            <input
                                className={password !== "" ? "has-val input" : "input"}
                                type="password"
                                name="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="focus-input" data-placeholder="Password"></span>
                        </div>

                        <div className="container-login-form-btn">
                            <button className="login-form-btn" onClick={handleSignIn}>Login</button>
                        </div>
                        
                    </form>
                </div>
            </div>
        </div>
    );
}
