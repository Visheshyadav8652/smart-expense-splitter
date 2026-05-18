import { useState } from "react";
import { api } from "../api.js";

const BillParseForm = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const parseBill = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await api.parseBill(text);
      setItems(result.items || []);
      setTotalAmount(result.totalAmount ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const readFileAsDataUrl = (selectedFile) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(selectedFile);
    });

  const downscaleImage = async (dataUrl) => {
    const image = new Image();
    const loaded = new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load image"));
    });

    image.src = dataUrl;
    await loaded;

    const maxWidth = 1200;
    const scale = Math.min(1, maxWidth / image.width);
    const targetWidth = Math.round(image.width * scale);
    const targetHeight = Math.round(image.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to process image");
    }

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const parseBillImage = async () => {
    setError("");
    if (!file) {
      setError("Select an image first.");
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setError("Image is too large. Please choose a smaller file.");
      return;
    }

    setLoading(true);
    try {
      const rawData = await readFileAsDataUrl(file);
      const imageData = await downscaleImage(rawData);
      const result = await api.parseBillImage(imageData);
      setItems(result.items || []);
      setTotalAmount(result.totalAmount ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Bill text parser</h3>
      <div className="form">
        <textarea
          className="textarea"
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste bill text here"
        />
        <div className="split-list">
          <button type="button" className="btn" onClick={parseBill} disabled={loading}>
            {loading ? "Parsing..." : "Parse bill"}
          </button>
          <label className="split-item">
            <input
              type="file"
              accept="image/*"
              className="text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-stone-800"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <span className="text-xs text-stone-500">
              {file ? file.name : "Choose bill image"}
            </span>
          </label>
          <button type="button" className="btn btn-secondary" onClick={parseBillImage} disabled={loading}>
            Parse image
          </button>
        </div>
        {items.length > 0 && (
          <div>
            <div className="helper">Items</div>
            <ul className="mono-list">
              {items.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  {item.name}: {item.amount}
                </li>
              ))}
            </ul>
            <div className="helper">Total: {totalAmount ?? "-"}</div>
          </div>
        )}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default BillParseForm;
