import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Get today's date/time
    const now = new Date();

    // Start of today
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // End of today
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Run independent queries together
    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      upcomingAppointments,
      recentPatients,
    ] = await Promise.all([
      // Active patients
      Patient.countDocuments({
        status: "active",
      }),

      // Active doctors
      Doctor.countDocuments({
        status: "active",
      }),

      // Today's appointments
      Appointment.find({
        appointmentDate: today,
        status: {
          $in: ["scheduled", "completed"],
        },
      })
        .populate("patient", "patientId name phone")
        .populate("doctor", "name specialization")
        .sort({ appointmentTime: 1 }),

      // Completed appointments
      Appointment.countDocuments({
        status: "completed",
      }),

      // Cancelled appointments
      Appointment.countDocuments({
        status: "cancelled",
      }),

      // Upcoming appointments
      Appointment.find({
        status: "scheduled",
        $or: [
          {
            appointmentDate: {
              $gt: today,
            },
          },
          {
            appointmentDate: today,
            appointmentTime: {
              $gte: now.toTimeString().slice(0, 5),
            },
          },
        ],
      })
        .populate("patient", "patientId name phone")
        .populate("doctor", "name specialization")
        .sort({
          appointmentDate: 1,
          appointmentTime: 1,
        })
        .limit(5),

      // Recently registered patients
      Patient.find({
        status: "active",
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("patientId name phone gender createdAt"),
    ]);

    res.json({
      stats: {
        totalPatients,
        totalDoctors,
        todayAppointments: todayAppointments.length,
        completedAppointments,
        cancelledAppointments,
      },
      todayAppointments,
      upcomingAppointments,
      recentPatients,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
    });
  }
};
