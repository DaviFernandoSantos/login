import React, { useState, useEffect } from "react";
import { getFirestore, getDocs, collection, addDoc, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updatePassword, updateEmail, deleteUser, sendEmailVerification } from "firebase/auth"; // Adicione sendEmailVerification
import { app, auth } from "../../services/firebaseConfig";
import { Link } from "react-router-dom";
import "./styles.css";
import greenForestVideo from "../../assets/green-forest.mp4";

export const Home = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editedUserId, setEditedUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [passwordError, setPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");

    const db = getFirestore(app);
    const userCollectionRef = collection(db, "users");

    async function criarUser() {
        if (!password || !email) {
            console.error("Email ou senha não preenchidos");
            return;
        }

        if (password.length < 8 || password.length > 14) {
            setPasswordError("A senha deve ter entre 8 e 14 caracteres.");
            return;
        } else {
            setPasswordError("");
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Usuário criado no Firebase Authentication com sucesso!");
            await addDoc(userCollectionRef, {
                name,
                email,
                userId: user.uid
            });
            setName("");
            setEmail("");
            setPassword("");
            getUsers();
            // Envia e-mail de verificação para o novo usuário
            await sendEmailVerification(user);
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            if (error.code === "auth/email-already-in-use") {
                setEmailError("Email já está sendo usado por outra conta.");
            } else {
                setEmailError("Erro ao criar usuário. Por favor, tente novamente.");
            }
        }
    }

    useEffect(() => {
        getUsers();
    }, []);

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

    async function deleteUsers(id) {
        const userDoc = doc(db, 'users', id);
        const userData = await getDoc(userDoc);
        const userId = userData.data().userId;

        // Remove o usuário do Firebase Authentication
        try {
            const user = auth.currentUser; // Corrigido para usar currentUser
            await deleteUser(user);
            console.log("Usuário removido do Firebase Authentication com sucesso!");
        } catch (error) {
            console.error("Erro ao remover usuário do Firebase Authentication:", error);
        }

        // Remove o usuário do Firestore
        await deleteDoc(userDoc);
        getUsers();
    }

    async function editUser(id) {
        const editedUser = users.find(user => user.id === id);
        setName(editedUser.name);
        setEmail(editedUser.email);
        setEditMode(true);
        setEditedUserId(id);
    }

    async function updateUser() {
        const userDoc = doc(db, 'users', editedUserId);
        await updateDoc(userDoc, { name, email });
        setEditMode(false);
        setName("");
        setEmail("");
        getUsers();
        if (password) {
            const user = auth.currentUser;
            await updatePassword(user, password);
            console.log("Senha atualizada no Firebase Authentication com sucesso!");
        }
        if (email) {
            const user = auth.currentUser;
            
            // Verifica se o novo e-mail foi verificado pelo usuário
            const isEmailVerified = user.emailVerified;
            
            if (isEmailVerified) {
                await updateEmail(user, email);
                console.log("Email atualizado no Firebase Authentication com sucesso!");
            } else {
                console.error("Por favor, verifique seu novo e-mail antes de alterá-lo.");
                // Aqui você pode notificar o usuário para verificar seu novo e-mail.
            }
        }
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
                {passwordError && <p className="error-message">{passwordError}</p>}
                {emailError && <p className="error-message">{emailError}</p>}
                {editMode ? (
                    <button className="login-form-btn form-btn" onClick={updateUser}>Salvar</button>
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
            </div>
        </div>
    );
};

export default Home;
