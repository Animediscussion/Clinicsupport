import { useEffect, useState } from "react";

import {
  Paper,
  TextInput,
  Select,
  Textarea,
  Button,
  Stack,
  Title,
  Group,
  Alert,
} from "@mantine/core";

import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

import api from "../services/api";

function AppointmentForm({ onSuccess, onCancel }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    date: "",
    time: "",
    reason: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch patients and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [patientsResponse, doctorsResponse] = await Promise.all([
          api.get("/patients"),
          api.get("/doctors"),
        ]);

        setPatients(patientsResponse.data);
        setDoctors(doctorsResponse.data);
      } catch (error) {
        console.error("Failed to load patients/doctors:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load patients or doctors.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.patient) {
      setError("Please select a patient.");
      return;
    }

    if (!form.doctor) {
      setError("Please select a doctor.");
      return;
    }

    if (!form.date) {
      setError("Please select an appointment date.");
      return;
    }

    if (!form.time) {
      setError("Please select an appointment time.");
      return;
    }

    if (!form.reason.trim()) {
      setError("Please enter the reason for the appointment.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/appointments", {
        patient: form.patient,
        doctor: form.doctor,
        date: form.date,
        time: form.time,
        reason: form.reason,
        notes: form.notes,
      });

      setSuccess("Appointment created successfully.");

      setForm({
        patient: "",
        doctor: "",
        date: "",
        time: "",
        reason: "",
        notes: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create appointment:", error);

      setError(
        error.response?.data?.message || "Failed to create appointment.",
      );
    } finally {
      setLoading(false);
    }
  };

  const patientOptions = patients.map((patient) => ({
    value: patient._id,
    label: patient.name,
  }));

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor._id,
    label: doctor.name,
  }));

  // Today's date for the minimum appointment date
  const today = new Date().toISOString().split("T")[0];

  return (
    <Paper withBorder shadow="sm" p="lg" radius="md">
      <Title order={3} mb="md">
        Schedule Appointment
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack>
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="green" icon={<IconCheck size={18} />}>
              {success}
            </Alert>
          )}

          <Select
            label="Patient"
            placeholder={loadingData ? "Loading patients..." : "Select patient"}
            data={patientOptions}
            value={form.patient}
            onChange={(value) => handleChange("patient", value)}
            searchable
            clearable
            disabled={loadingData}
            required
          />

          <Select
            label="Doctor"
            placeholder={loadingData ? "Loading doctors..." : "Select doctor"}
            data={doctorOptions}
            value={form.doctor}
            onChange={(value) => handleChange("doctor", value)}
            searchable
            clearable
            disabled={loadingData}
            required
          />

          {/* Appointment Date */}

          <TextInput
            label="Appointment Date"
            type="date"
            min={today}
            value={form.date}
            onChange={(event) =>
              handleChange("date", event.currentTarget.value)
            }
            required
          />

          {/* Appointment Time */}

          <TextInput
            label="Appointment Time"
            type="time"
            value={form.time}
            onChange={(event) =>
              handleChange("time", event.currentTarget.value)
            }
            required
          />

          <TextInput
            label="Reason"
            placeholder="Reason for appointment"
            value={form.reason}
            onChange={(event) =>
              handleChange("reason", event.currentTarget.value)
            }
            required
          />

          <Textarea
            label="Notes"
            placeholder="Additional notes"
            minRows={3}
            value={form.notes}
            onChange={(event) =>
              handleChange("notes", event.currentTarget.value)
            }
          />

          <Group justify="flex-end" mt="md">
            {onCancel && (
              <Button type="button" variant="default" onClick={onCancel}>
                Cancel
              </Button>
            )}

            <Button type="submit" loading={loading} disabled={loadingData}>
              Schedule Appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

export default AppointmentForm;
