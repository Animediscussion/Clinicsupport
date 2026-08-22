import { useState } from "react";
import {
  Paper,
  TextInput,
  NumberInput,
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

function PatientForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    bloodGroup: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/patients", {
        name: form.name,
        age: form.age,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        address: form.address,
        bloodGroup: form.bloodGroup,
      });

      setSuccess("Patient added successfully.");

      setForm({
        name: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        bloodGroup: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add patient. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder shadow="sm" p="lg" radius="md">
      <Title order={3} mb="md">
        Add New Patient
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

          <TextInput
            label="Patient Name"
            placeholder="Enter patient name"
            value={form.name}
            onChange={(event) =>
              handleChange("name", event.currentTarget.value)
            }
            required
          />

          <NumberInput
            label="Age"
            placeholder="Enter age"
            min={0}
            max={150}
            value={form.age}
            onChange={(value) => handleChange("age", value)}
            required
          />

          <Select
            label="Gender"
            placeholder="Select gender"
            data={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" },
            ]}
            value={form.gender}
            onChange={(value) => handleChange("gender", value)}
            required
          />

          <Select
            label="Blood Group"
            placeholder="Select blood group"
            data={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            value={form.bloodGroup}
            onChange={(value) => handleChange("bloodGroup", value)}
          />

          <TextInput
            label="Phone"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={(event) =>
              handleChange("phone", event.currentTarget.value)
            }
            required
          />

          <TextInput
            label="Email"
            type="email"
            placeholder="patient@example.com"
            value={form.email}
            onChange={(event) =>
              handleChange("email", event.currentTarget.value)
            }
          />

          <Textarea
            label="Address"
            placeholder="Enter patient address"
            minRows={3}
            value={form.address}
            onChange={(event) =>
              handleChange("address", event.currentTarget.value)
            }
          />

          <Group justify="flex-end" mt="md">
            {onCancel && (
              <Button type="button" variant="default" onClick={onCancel}>
                Cancel
              </Button>
            )}

            <Button type="submit" loading={loading}>
              Add Patient
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

export default PatientForm;
