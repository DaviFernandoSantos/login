import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebaseConfig";
import "./styles.css";
import greenForestVideo from "../../assets/green-forest.mp4";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword    ] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    function handleSignIn(e) {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Usuário logado:", user);
                navigate("/home");
                // Limpar estados de erro após login bem-sucedido
                setErrorMessage("");
            })
            .catch((error) => {
                switch (error.code) {
                    case "auth/invalid-email":
                        setErrorMessage("Email incorreto.");
                        break;
                    case "auth/user-not-found":
                        setErrorMessage("Usuário não encontrado.");
                        break;
                    case "auth/wrong-password":
                        setErrorMessage("Senha incorreta.");
                        break;
                    default:
                        setErrorMessage("Email e/ou senha incorretos.");
                }
                console.error("Erro ao fazer login:", error);
            });
    }

    return (
        <div className="container">
            <video autoPlay loop muted className="background-video">
                <source src={greenForestVideo} type="video/mp4" />
            </video>
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

                        {errorMessage && <p className="error-message">{errorMessage}</p>}

                        <div className="container-login-form-btn">
                            <button className="login-form-btn" onClick={handleSignIn}>Login</button>
                        </div>
                        
                    </form>
                </div>
            </div>
        </div>
    );
}
