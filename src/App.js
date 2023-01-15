import React, { useState, useEffect, useRef } from "react";
import "./App.css";
// import samplePDF from "./na.pdf";
import SinglePage from "./Components/SinglePage";
import ModifyPage from "./Components/ModifyPage";
import AutoTextArea from "./Components/AutoTextArea";
import fetchAPI from "./services/highlightPdf";

var pdfData = atob(
  "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog" +
    "IC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAv" +
    "TWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0K" +
    "Pj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAg" +
    "L1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+" +
    "PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9u" +
    "dAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2Jq" +
    "Cgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJU" +
    "CjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVu" +
    "ZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4g" +
    "CjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAw" +
    "MDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9v" +
    "dCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G"
);

export default function App() {
  const [result, setResult] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [redoStack, setRedoStack] = useState([]);
  const [flag, setFlag] = useState("");
  const [bounds, setBounds] = useState({});
  const [isText, setIsText] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const tempRef = useRef(null);
  const [samplePDF, setPDFDataHighlight] = useState({ data: pdfData });
  const [pdfLoading, setPdfLoading] = useState(false);

  async function handleClick() {
    setPdfLoading(true);
    var response = await fetchAPI();
    var pdfDataHigh = await atob(response);
    await setPDFDataHighlight({ data: pdfDataHigh });
    console.log("pdfDataHigh", pdfDataHigh);
    await setPdfLoading(false);
    return await pdfDataHigh;
  }

  useEffect(() => {
    if (isText) {
      setIsText(false);
    }
  }, [result]);

  //Keep track of current page number
  const pageChange = (num) => {
    setPageNumber(num);
  };

  //Function to add text in PDF
  const addText = () => {
    //Flag to change cursor if text
    setIsText(true);
    document.getElementById("drawArea").addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        setResult((result) => [
          ...result,
          {
            id: generateKey(e.pageX),
            x: e.pageX,
            y: e.pageY - 10,
            text: "",
            page: pageNumber,
            type: "text",
            ref: tempRef
          }
        ]);
      },
      { once: true }
    );
  };

  //Undo function for both line and text
  const undo = () => {
    let temp = result.pop();
    if (temp) {
      if (temp.type === "freehand") {
        //Flag for DrawArea reference
        setFlag("undo");
      }
      setRedoStack((stack) => [...stack, temp]);
      setResult(result);
    }
  };

  //Flag for DrawArea reference
  const changeFlag = () => {
    setFlag("");
  };

  //Redo functionality
  const redo = () => {
    let top = redoStack.pop();
    if (top) {
      if (top.type === "freehand") {
        //Flag for DrawArea reference
        setFlag("redo");
      }
      setResult((res) => [...res, top]);
    }
  };

  const getPaths = (el) => {
    setResult((res) => [...res, el]);
  };

  const getBounds = (obj) => {
    setBounds(obj);
  };

  const generateKey = (pre) => {
    return `${pre}_${new Date().getTime()}`;
  };

  const onTextChange = (id, txt, ref) => {
    let indx = result.findIndex((x) => x.id === id);
    let item = { ...result[indx] };
    item.text = txt;
    item.ref = ref;
    result[indx] = item;
    setResult(result);
  };

  const changeButtonType = (type) => {
    setButtonType(type);
  };

  const resetButtonType = () => {
    setButtonType("");
  };

  return (
    <div className="App">
      {result.map((res) => {
        if (res.type === "text") {
          let isShowing = "hidden";
          if (res.page === pageNumber) {
            isShowing = "visible";
          }
          return (
            <AutoTextArea
              key={res.id}
              unique_key={res.id}
              val={res.text}
              onTextChange={onTextChange}
              style={{
                visibility: isShowing,
                color: "red",
                fontWeight: "normal",
                fontSize: 16,
                zIndex: 20,
                position: "absolute",
                left: res.x + "px",
                top: res.y + "px"
              }}
            ></AutoTextArea>
            //<h1 key={index} style = {{textAlign: "justify",color: "red" ,fontWeight:'normal',width: 200, height: 80,fontSize: 33+'px', fontSize: 16, zIndex:10, position: "absolute", left: res.x+'px', top: res.y +'px'}}>{res.text}</h1>
          );
        } else {
          return null;
        }
      })}

      <h1 style={{ color: "#3f51b5" }}>REACT PDF EDITOR</h1>

      <hr />

      <div className="navbar">
        <button onClick={undo} style={{ marginTop: "1%", marginBottom: "1%" }}>
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-undo"></i>
        </button>
        <button onClick={redo} style={{ marginTop: "1%", marginBottom: "1%" }}>
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-redo"></i>
        </button>
        <button
          onClick={addText}
          style={{ marginTop: "1%", marginBottom: "1%" }}
        >
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-text"></i>
        </button>
        <button
          onClick={() => changeButtonType("draw")}
          style={{ marginTop: "1%", marginBottom: "1%" }}
        >
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-pencil"></i>
        </button>
        <button
          onClick={() => changeButtonType("download")}
          style={{ marginTop: "1%", marginBottom: "1%" }}
        >
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-download"></i>
        </button>
        <button
          onClick={handleClick}
          style={{ marginTop: "1%", marginBottom: "1%" }}
        >
          <i style={{ fontSize: 25 }} className="fa fa-fw ">
            API
          </i>
        </button>
      </div>

      {/* 
      <button onClick = {undo} style = {{marginTop: "1%"}}>Undo</button>
      <button onClick = {redo} style = {{marginTop: "1%"}}>Redo</button>
      <br></br>
      <button onClick={addText} style = {{marginTop: "1%"}}>Add Text</button>*/}
      <SinglePage
        resetButtonType={resetButtonType}
        buttonType={buttonType}
        cursor={isText ? "text" : "default"}
        pdf={samplePDF}
        pageChange={pageChange}
        getPaths={getPaths}
        flag={flag}
        getBounds={getBounds}
        changeFlag={changeFlag}
      />
      <ModifyPage
        resetButtonType={resetButtonType}
        buttonType={buttonType}
        pdf={samplePDF}
        result={result}
        bounds={bounds}
      />
      <hr></hr>
    </div>
  );
}
