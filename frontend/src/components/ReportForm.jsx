import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiX, FiAlertTriangle, FiImage } from "react-icons/fi";
import L from "leaflet";

const ReportForm = ({ location, onClose, onSubmitted, reports }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "road",
    severity: "medium",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addressDetails, setAddressDetails] = useState({
    city: "",
    area: "",
    display_name: "",
  });

  useEffect(() => {
    const fetchAddressDetails = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
        );
        const data = await res.json();
        const address = data.address || {};

        // Extract city/area
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.county ||
          "";
        const area =
          address.suburb || address.neighbourhood || address.road || "";

        setAddressDetails({
          city,
          area,
          display_name: data.display_name,
        });
      } catch (err) {
        console.error("Failed to fetch address details:", err);
      }
    };

    if (location) {
      fetchAddressDetails();
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("severity", formData.severity);
    data.append("status", "open");
    data.append("lat", parseFloat(location.lat.toFixed(6)));
    data.append("lng", parseFloat(location.lng.toFixed(6)));
    data.append(
      "address",
      addressDetails.display_name ||
        `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`
    );
    data.append("city", addressDetails.city);
    data.append("area", addressDetails.area);

    if (image) {
      data.append("image", image);
    }

    try {
      await axios.post("/api/reports", data);
      onSubmitted();
    } catch (err) {
      console.error(err);
      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        const errorMsg = err.response.data.errors.map((e) => e.msg).join(", ");
        setError(errorMsg);
      } else {
        setError(err.response?.data?.message || "Failed to submit report");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">New Report</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              {addressDetails.city && addressDetails.area
                ? `${addressDetails.area}, ${addressDetails.city}`
                : "Infrastructure Issue"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md flex items-start gap-3 animate-pulse">
              <FiAlertTriangle className="shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
              Issue Title
            </label>
            <input
              type="text"
              name="title"
              required
              minLength={5}
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="e.g., Broken street light"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
              Details
            </label>
            <textarea
              name="description"
              required
              minLength={10}
              rows={3}
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="Explain the problem in detail..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                Category
              </label>
              <select
                name="category"
                required
                className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="road">Road</option>
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
                <option value="sanitation">Sanitation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                Severity
              </label>
              <select
                name="severity"
                required
                className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                value={formData.severity}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <FiImage /> Evidence Image (Optional)
            </label>
            <div className="mt-1 flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                {image ? (
                  <img
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiImage className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Tap to upload photo</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-widest"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all uppercase tracking-widest"
            >
              {loading ? "Posting..." : "Post Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
