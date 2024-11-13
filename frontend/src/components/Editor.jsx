import React, {useState} from "react";
import "./editor.css";

export function Editor() {

    function clicked(event) {
        
        fetch('http://localhost:5000/', {
            method : "POST",
            mode : "cors",
            headers: {
                "content-type" : "text/plain",
            },
            body : code
        })
        .then((res) => res.text())
        .then((data) => {
            setOutput(data);
        })
        .catch((error)=>console.error("Error: ", error));
    }

    function onChange(event) {
        setCode(event.target.value);
    }

    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");

    return (
        <div className="main-div">
            <div className="editor-div">
                <div>
                    <textarea 
                        onChange={onChange} className="text-area" name="editor" id="input-area"
                    ></textarea>
                </div>
                <div>
                    <textarea 
                        className="text-area" name="editor" id="output-area" value={output} readOnly
                    ></textarea>
                </div>
            </div>
            <button className="button" onClick={clicked}>Run</button>
        </div>
    );
}