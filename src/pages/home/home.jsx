import React, { useState, useEffect } from "react";
import { getFirestore, getDocs, collection, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { app, auth } from "../../services/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";
import greenForestVideo from "../../assets/green-forest.mp4";

export const Home = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editedUserId, setEditedUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [feedback, setFeedback] = useState("");
    const [feedbackType, setFeedbackType] = useState("");
    const navigate = useNavigate();

    const db = getFirestore(app);
    const userCollectionRef = collection(db, "users");

    useEffect(() => {
        getUsers();
    }, []);

    async function criarUser() {
        if (!password || !email) {
            setFeedback("Email ou senha não preenchidos");
            setFeedbackType("error");
            return;
        }

        if (password.length < 8 || password.length > 14) {
            setFeedback("A senha deve ter entre 8 e 14 caracteres.");
            setFeedbackType("error");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setFeedback("Usuário criado no Firebase Authentication com sucesso!");
            setFeedbackType("success");
            setTimeout(() => {
                setFeedback("");
                setFeedbackType("");
            }, 3000);
            await addDoc(userCollectionRef, {
                name,
                email,
                userId: user.uid
            });
            setName("");
            setEmail("");
            setPassword("");
            getUsers();
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            setFeedback("Erro ao criar usuário. Por favor, tente novamente.");
            setFeedbackType("error");
            setTimeout(() => {
                setFeedback("");
                setFeedbackType("");
            }, 3000);
        }
    }

    async function updatePasswordAndUser() {
        const user = auth.currentUser;
        if (user) {
            try {
                await auth.currentUser.getIdToken(true);
                const userDoc = doc(db, 'users', editedUserId);
                await updateDoc(userDoc, { name, email });
                setEditMode(false);
                setName("");
                setEmail("");
                getUsers();

                if (password && (password.length < 8 || password.length > 14)) {
                    setFeedback("A senha deve ter entre 8 e 14 caracteres.");
                    setFeedbackType("error");
                    setTimeout(() => {
                        setFeedback("");
                        setFeedbackType("");
                    }, 3000);
                    return;
                }

                if (password) {
                    try {
                        // Atualizar a senha
                        await updatePassword(user, password);
                        setFeedback("Senha atualizada no Firebase Authentication com sucesso!");
                        setFeedbackType("success");
                        setTimeout(() => {
                            setFeedback("");
                            setFeedbackType("");
                        }, 3000);
                    } catch (passwordError) {
                        console.error("Erro ao atualizar a senha:", passwordError);
                        setFeedback("Erro ao atualizar a senha. Por favor, tente novamente.");
                        setFeedbackType("error");
                        setTimeout(() => {
                            setFeedback("");
                            setFeedbackType("");
                        }, 3000);
                    }
                }

                if (email) {
                    try {
                        // Atualizar o e-mail
                        await updateEmail(user, email);
                        setFeedback("Email atualizado no Firebase Authentication com sucesso!");
                        setFeedbackType("success");
                        setTimeout(() => {
                            setFeedback("");
                            setFeedbackType("");
                        }, 3000);
                    } catch (emailError) {
                        console.error("Erro ao atualizar o e-mail no Firebase Authentication:", emailError);
                        setFeedback("Erro ao atualizar o e-mail. Por favor, tente novamente.");
                        setFeedbackType("error");
                        setTimeout(() => {
                            setFeedback("");
                            setFeedbackType("");
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error("Erro ao atualizar senha e usuário:", error);
                setFeedback("Erro ao atualizar senha e usuário. Por favor, tente novamente.");
                setFeedbackType("error");
                setTimeout(() => {
                    setFeedback("");
                    setFeedbackType("");
                }, 3000);
            }
        } else {
            console.error("Nenhum usuário autenticado encontrado. Redirecionando para a página de login...");
            navigate("/");
        }
    }

    async function deleteUsers(id) {
        const userDoc = doc(db, 'users', id);
        await deleteDoc(userDoc);
        getUsers();
        setFeedback("Usuário deletado com sucesso!");
        setFeedbackType("delete");
        setTimeout(() => {
            setFeedback("");
            setFeedbackType("");
        }, 3000);
    }

    async function getUsers() {
        try {
            const querySnapshot = await getDocs(userCollectionRef);
            const usersData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        }
    }

    async function editUser(id) {
        const editedUser = users.find(user => user.id === id);
        setName(editedUser.name);
        setEmail(editedUser.email);
        setEditMode(true);
        setEditedUserId(id);
    }

    return (
        <div className="container">
            <video autoPlay loop muted className="background-video">
                <source src={greenForestVideo} type="video/mp4" />
            </video>
            <div className="content-container">
                <div className="text-title">
                    <h2>Bem-vindo à BombinhaJS</h2>
                    <Link to="/" className="login-form-btn">Sair</Link>
                </div>
                <div className="wrap-input">
                    <input
                        className={name !== "" ? "has-val input" : "input"}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <span className="focus-input" data-placeholder="Nome"></span>
                </div>

                <div className="wrap-input">
                    <input
                        className={email !== "" ? "has-val input" : "input"}
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <span className="focus-input" data-placeholder="Email"></span>
                </div>
                <div className="wrap-input">
                    <input
                        className={password !== "" ? "has-val input" : "input"}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="focus-input" data-placeholder="Password"></span>
                </div>
                {(feedbackType === "error") && <p className="error-message">{feedback}</p>}
                {(feedbackType === "success") && <div className="success-message">{feedback}</div>}
                {(feedbackType === "delete") && <div className="delete-message">{feedback}</div>}
                {editMode ? (
                    <button className="login-form-btn form-btn" onClick={updatePasswordAndUser}>Salvar</button>
                ) : (
                    <button className="login-form-btn form-btn" onClick={criarUser}>Criar User</button>
                )}

                <ul className="list-ul-form">
                    {users.map((user, index) => (
                        <li className="list-li-form list-li" key={index}>
                            <div className="login-form-moblie-name">
                                <div className="container-name-email">
                                    <strong className="form-name">Nome: {user.name} </strong>
                                </div>
                                <div className="container-name-email">
                                    <strong className="form-name">Email: {user.email}</strong>
                                </div>
                            </div>
                            <div className="login-form-moblie">
                                <button className="login-form-btn" onClick={() => editUser(user.id)}>Editar</button>
                                <button className="login-form-btn" onClick={() => deleteUsers(user.id)}>Deletar</button>
                            </div>
                        </li>
                    ))}
                </ul>

                {feedback && (
                    <div className={`feedback-container ${feedbackType}`}>
                        <div className="feedback-text">{feedback}</div>
                        <button className="close-btn" onClick={() => setFeedback("")}>X</button>
                        <div className="progress-bar"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
