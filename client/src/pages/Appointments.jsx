import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Card,
  Group,
  Loader,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";

import { DatePickerInput } from "@mantine/dates";

import api from "../services/api";

function Appointments() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch patients and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [patientResponse, doctorResponse] = await Promise.all([
          api.get("/patients"),
          api.get("/doctors"),
        ]);

        setPatients(patientResponse.data);
        setDoctors(doctorResponse.data);
      } catch (err) {
        setError("Failed to load patients or doctors.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert Date to YYYY-MM-DD using local calendar date
  const formatDate = (value) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Fetch available slots whenever doctor or date changes
  useEffect(() => {
    if (!doctor || !date) {
      setSlots([]);
      setTime(null);
      return;
    }

    let cancelled = false;

    const fetchSlots = async () => {
      try {
        setLoading(true);
        setError("");
        setTime(null);

        const response = await api.get("/appointments/availability", {
          params: {
            doctorId: doctor,
            date: formatDate(date),
          },
        });

        if (!cancelled) {
          setSlots(response.data.availableSlots);
        }
      } catch (err) {
        if (!cancelled) {
          setSlots([]);
          setError(
            err.response?.data?.message || "Failed to load available slots.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSlots();

    return () => {
      cancelled = true;
    };
  }, [doctor, date]);

  // Book appointment
  const handleBooking = async () => {
    if (!patient || !doctor || !date || !time) {
      setError("Please select patient, doctor, date and time.");
      return;
    }

    try {
      setBooking(true);
      setError("");
      setSuccess("");

      await api.post("/appointments", {
        patient,
        doctor,
        appointmentDate: formatDate(date),
        appointmentTime: time,
        reason,
        notes,
      });

      setSuccess("Appointment booked successfully!");

      // Clear booking form
      setPatient(null);
      setDoctor(null);
      setDate(null);
      setTime(null);
      setReason("");
      setNotes("");
      setSlots([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Book Appointment</Title>

        <Text c="dimmed" size="sm">
          Schedule a new patient appointment.
        </Text>
      </div>

      {error && (
        <Alert color="red" withCloseButton onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="green" withCloseButton onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Paper withBorder p="lg" radius="md">
        <Stack>
          <Title order={4}>Appointment Information</Title>

          <Select
            label="Select Patient"
            placeholder="Choose a patient"
            searchable
            data={patients.map((item) => ({
              value: item._id,
              label: `${item.patientId} - ${item.name}`,
            }))}
            value={patient}
            onChange={setPatient}
          />

          <Select
            label="Select Doctor"
            placeholder="Choose a doctor"
            searchable
            data={doctors
              .filter((item) => item.status === "active")
              .map((item) => ({
                value: item._id,
                label: `${item.name} - ${item.specialization}`,
              }))}
            value={doctor}
            onChange={setDoctor}
          />

          <DatePickerInput
            label="Appointment Date"
            placeholder="Select appointment date"
            minDate={new Date()}
            value={date}
            onChange={setDate}
            clearable
          />

          {doctor && date && (
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={600}>Available Time Slots</Text>

                {loading && <Loader size="xs" />}
              </Group>

              {slots.length === 0 && !loading ? (
                <Text size="sm" c="dimmed">
                  No available slots for this date.
                </Text>
              ) : (
                <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }}>
                  {slots.map((slot) => (
                    <Button
                      key={slot}
                      variant={time === slot ? "filled" : "light"}
                      onClick={() => setTime(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </SimpleGrid>
              )}
            </Stack>
          )}

          <Textarea
            label="Reason for Visit"
            placeholder="Describe the patient's symptoms or reason for consultation"
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
          />

          <Textarea
            label="Additional Notes"
            placeholder="Optional notes"
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
          />

          <Button
            fullWidth
            loading={booking}
            disabled={!patient || !doctor || !date || !time}
            onClick={handleBooking}
          >
            Book Appointment
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default Appointments;
