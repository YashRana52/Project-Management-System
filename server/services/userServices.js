import User from "../models/user.js";

export const createUser = async (userData) => {
  try {
    const user = new User(userData);
    return await user.save();
  } catch (error) {
    throw new Error(`Error creating user:${error.message}`);
  }
};
export const updateUser = async (id, updateData) => {
  try {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");
  } catch (error) {
    throw new Error(`Error updatinguser:${error.message}`);
  }
};
export const getUserById = async (id) => {
  try {
    return await User.findById(id).select(
      "-password -resetPasswordToken -resetPasswordExpire",
    );
  } catch (error) {
    throw new Error(`ErrorfindingUser:${error.message}`);
  }
};
export const deleteUser = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    return await User.deleteOne({ _id: id });
  } catch (error) {
    throw new Error(`Error deletingUser: ${error.message}`);
  }
};

export const getAllUsers = async () => {
  const query = { role: { $ne: "Admin" } };

  const users = await User.find(query)
    .select("-password -resetPasswordToken -resetPasswordExpire")
    .populate({
      path: "supervisor",
      select: "name",
    })
    .populate({
      path: "project",
      select: "title",
    })
    .sort({ createdAt: -1 });

  return { users };
};

export const assignSupervisorDirectly = async (studentId, supervisorId) => {
  const student = await User.findOne({ _id: studentId, role: "Student" });
  const supervisor = await User.findOne({ _id: supervisorId, role: "Teacher" });

  if (!student || !supervisor) {
    throw new Error("Student or supervisor not found");
  }

  if (!supervisor.hasCapacity()) {
    throw new Error("Supervisor has reached maximum capacity");
  }

  // Assign supervisor to student and add student to supervisor's list
  student.supervisor = supervisor._id;
  supervisor.assignedStudents.push(student._id);

  await Promise.all([student.save(), supervisor.save()]);

  return { student, supervisor };
};
