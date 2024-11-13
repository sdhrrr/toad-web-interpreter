import "./navbar.css";

export function Navbar() {
    return (
        <div className="navbar">
            <h1 className="title">Toad Interpreter</h1>
            <div className="nav-right">
                <button className="toggle-dark btn">Toggle dark mode</button>
                <button className="nav-link btn">Source code</button>
            </div>
        </div>
    );
}