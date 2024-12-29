"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useFetch from '../../../hooks/useFetch';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Lakshadweep", "Delhi", "Puducherry"
];

const StudentSignUp = () => {
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    street: "",
    state: "",
    standard: "",
  });

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const createData = useFetch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const payload = {
      stud_name:studentData.name,
        stud_email:studentData.email,
        stud_password:studentData.password,
        city:studentData.city,
        street:studentData.street,
        state:studentData.state,
        stand_id:studentData.standard
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await createData(baseUrl+'/user/student/signup', 'POST', payload, 201);

    if (!res) {
      throw new Error('An error occured while creating educator');
    }else router.push('/login');
  } catch (err) {
    console.log("en error occurred");
    alert("an error");
  }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Student Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={studentData.name}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="w-full p-3 border rounded-md"
            required
          />
          <input
            type="email"
            name="email"
            value={studentData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full p-3 border rounded-md"
            required
          />
          <input
            type="password"
            name="password"
            value={studentData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="w-full p-3 border rounded-md"
            required
          />
          <input
            type="text"
            name="city"
            value={studentData.city}
            onChange={handleInputChange}
            placeholder="City"
            className="w-full p-3 border rounded-md"
            required
          />
          <input
            type="text"
            name="street"
            value={studentData.street}
            onChange={handleInputChange}
            placeholder="Street"
            className="w-full p-3 border rounded-md"
            required
          />
          <select
            name="state"
            value={studentData.state}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-md"
            required
          >
            {indianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <select
            name="standard"
            value={studentData.standard}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-md"
            required
          >
            <option value="">Select Class</option>
            <option value="1">Standard 8</option>
            <option value="2">Standard 9</option>
            <option value="3">Standard 10</option>
            {/* Add other standards as per your SQL schema */}
          </select>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-md"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentSignUp;
