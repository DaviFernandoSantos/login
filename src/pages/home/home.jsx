import React, { useState, useEffect } from "react";
import { getFirestore, getDocs, collection, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { app, auth } from "../../services/firebaseConfig";
import { Link } from "react-router-dom"; // Importe o Link do React Router Dom
import "./styles.css"; // Importe seu arquivo CSS para estilização
import greenForestVideo from "../../assets/green-forest.mp4";

export const Home = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editedUserId, setEditedUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [passwordError, setPasswordError] = useState(""); // Estado para armazenar mensagens de erro de senha

    const db = getFirestore(app);
    const userCollectionRef = collection(db, "users");

    async function criarUser() {
        // Verifica se a senha está preenchida
        if (!password) {
            console.error("Senha não preenchida");
            return;
        }

        // Verifica se a senha tem entre 8 e 14 caracteres
        if (password.length < 8 || password.length > 14) {
            setPasswordError("A senha deve ter entre 8 e 14 caracteres.");
            return;
        } else {
            setPasswordError(""); // Limpa o erro de senha se estiver tudo correto
        }

        // Cria o usuário no Firestore
        const user = await addDoc(userCollectionRef, {
            name,
            email,
        });
        console.log(user);

        // Cria o usuário no Firebase Authentication
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("Usuário criado no Firebase Authentication com sucesso!");
        } catch (error) {
            console.error("Erro ao criar usuário no Firebase Authentication:", error);
        }

        setName("");
        setEmail("");
        setPassword("");
        window.location.reload(); // Recarrega a página após criar o usuário
    }

    useEffect(() => {
        const getUsers = async () => {
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
        };

        getUsers();
    }, []);

    async function deleteUsers(id) {
        const userDoc = doc(db, 'users', id);
        await deleteDoc(userDoc);
        setUsers(users.filter(user => user.id !== id));
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
        window.location.reload(); // Recarrega a página após editar o usuário
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
