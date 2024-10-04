class Auth {
    static init() {
        firebase.auth().onAuthStateChanged((user) => {
            UI.updateUserInfo(user);
        });
    }

    static showLoginForm() {
        const loginHTML = `
            <div id="login-form">
                <h2>Login</h2>
                <input type="email" id="login-email" placeholder="Email" required>
                <input type="password" id="login-password" placeholder="Password" required>
                <button id="login-submit">Login</button>
                <p id="login-error"></p>
            </div>
        `;
        document.getElementById('game-container').innerHTML = loginHTML;
        document.getElementById('login-submit').addEventListener('click', Auth.login);
    }

    static showSignupForm() {
        const signupHTML = `
            <div id="signup-form">
                <h2>Sign Up</h2>
                <input type="email" id="signup-email" placeholder="Email" required>
                <input type="password" id="signup-password" placeholder="Password" required>
                <button id="signup-submit">Sign Up</button>
                <p id="signup-error"></p>
            </div>
        `;
        document.getElementById('game-container').innerHTML = signupHTML;
        document.getElementById('signup-submit').addEventListener('click', Auth.signup);
    }

    static login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                location.reload();
            })
            .catch((error) => {
                document.getElementById('login-error').textContent = error.message;
            });
    }

    static signup() {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                location.reload();
            })
            .catch((error) => {
                document.getElementById('signup-error').textContent = error.message;
            });
    }
}
