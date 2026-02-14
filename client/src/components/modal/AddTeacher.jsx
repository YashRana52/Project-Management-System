import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { X } from "lucide-react";

import { createTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice";

const AddTeacher = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    experties: "",
    maxStudents: 10,
  });

  const handleCreateTeacher = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      experties: formData.experties
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
    };

    dispatch(createTeacher(payload));
    dispatch(toggleTeacherModal());

    setFormData({
      name: "",
      email: "",
      department: "",
      password: "",
      experties: "",
      maxStudents: 10,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Add Teacher</h3>
          <button
            onClick={() => dispatch(toggleTeacherModal())}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field w-full p-2 border-b border-slate-600 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input-field w-full p-2 border-b border-slate-600 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="input-field w-full p-2 border-b border-slate-600 focus:outline-none"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Department
            </label>
            <select
              required
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="input-field w-full p-2 border-b border-slate-600 focus:outline-none"
            >
              <option value="" disabled>
                Select Department
              </option>
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Information Technology">
                Information Technology
              </option>
              <option value="Data Science">Data Science</option>
              <option value="Mechanical Engineering">
                Mechanical Engineering
              </option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Business Administration">
                Business Administration
              </option>
              <option value="Economics">Economics</option>
              <option value="Psychology">Psychology</option>
            </select>
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Expertise (comma separated)
            </label>
            <input
              type="text"
              required
              placeholder="AI, Machine Learning, Data Science"
              value={formData.experties}
              onChange={(e) =>
                setFormData({ ...formData, experties: e.target.value })
              }
              className="input-field w-full p-2 border-b border-slate-600 focus:outline-none"
            />
          </div>

          {/* Max Students */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Max Students
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.maxStudents}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxStudents: Number(e.target.value),
                })
              }
              className="input-field w-full p-2 border-b border-slate-600 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => dispatch(toggleTeacherModal())}
              className="btn-danger"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacher;
