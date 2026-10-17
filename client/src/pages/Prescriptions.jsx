import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconEye,
  IconPrinter,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import api from "../services/api";

const emptyMedicine = () => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  quantity: 1,
  instructions: "",
});

const emptyForm = () => ({
  patient: "",
  doctor: "",
  diagnosis: "",
  clinicalNotes: "",
  medicines: [emptyMedicine()],
  advice: "",
  followUpDate: "",
});

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const [form, setForm] = useState(emptyForm());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [prescriptionRes, patientRes, doctorRes] = await Promise.all([
        api.get("/prescriptions"),
        api.get("/patients"),
        api.get("/doctors"),
      ]);

      setPrescriptions(prescriptionRes.data);
      setPatients(patientRes.data);
      setDoctors(doctorRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load prescription data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const patientOptions = patients.map((patient) => ({
    value: patient._id,
    label: `${patient.name} (${patient.patientId})`,
  }));

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor._id,
    label: `${doctor.name} — ${doctor.specialization}`,
  }));

  const filteredPrescriptions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return prescriptions;

    return prescriptions.filter((item) =>
      [
        item.patient?.name,
        item.patient?.patientId,
        item.doctor?.name,
        item.diagnosis,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [prescriptions, search]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateMedicine = (index, field, value) => {
    setForm((current) => ({
      ...current,
      medicines: current.medicines.map((medicine, i) =>
        i === index ? { ...medicine, [field]: value } : medicine,
      ),
    }));
  };

  const addMedicine = () => {
    setForm((current) => ({
      ...current,
      medicines: [...current.medicines, emptyMedicine()],
    }));
  };

  const removeMedicine = (index) => {
    setForm((current) => ({
      ...current,
      medicines: current.medicines.filter((_, i) => i !== index),
    }));
  };

  const openCreateForm = () => {
    setForm(emptyForm());
    setFormOpened(true);
  };

  const createPrescription = async (event) => {
    event.preventDefault();

    const validMedicines = form.medicines.every(
      (medicine) =>
        medicine.name.trim() &&
        medicine.dosage.trim() &&
        medicine.frequency.trim() &&
        medicine.duration.trim() &&
        Number(medicine.quantity) >= 1,
    );

    if (!form.patient || !form.doctor) {
      notifications.show({
        title: "Missing information",
        message: "Select a patient and a doctor.",
        color: "red",
      });
      return;
    }

    if (!form.diagnosis.trim() || !validMedicines) {
      notifications.show({
        title: "Incomplete prescription",
        message: "Enter a diagnosis and complete all required medicine fields.",
        color: "red",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        followUpDate: form.followUpDate || null,
        medicines: form.medicines.map((medicine) => ({
          ...medicine,
          quantity: Number(medicine.quantity),
        })),
      };

      await api.post("/prescriptions", payload);

      notifications.show({
        title: "Prescription created",
        message: "The prescription was saved successfully.",
        color: "green",
      });

      setFormOpened(false);
      setForm(emptyForm());
      await fetchData();
    } catch (err) {
      notifications.show({
        title: "Unable to create prescription",
        message:
          err.response?.data?.message || "Please check the form and try again.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const openPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setViewOpened(true);
  };

  const printPrescription = () => {
    window.print();
  };

  if (loading) {
    return (
      <Group justify="center" p="xl">
        <Loader />
        <Text>Loading prescriptions...</Text>
      </Group>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Prescriptions</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Create and review patient prescriptions.
          </Text>
        </div>

        <Group>
          <Tooltip label="Refresh records">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={fetchData}
              aria-label="Refresh prescriptions"
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>

          <Button leftSection={<IconPlus size={16} />} onClick={openCreateForm}>
            New prescription
          </Button>
        </Group>
      </Group>

      {error && (
        <Alert color="red" title="Could not load data">
          {error}
          <Button mt="sm" variant="light" color="red" onClick={fetchData}>
            Try again
          </Button>
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        <Card withBorder>
          <Text size="sm" c="dimmed">
            Total prescriptions
          </Text>
          <Title order={2} mt="xs">
            {prescriptions.length}
          </Title>
        </Card>

        <Card withBorder>
          <Text size="sm" c="dimmed">
            Patients with prescriptions
          </Text>
          <Title order={2} mt="xs">
            {
              new Set(
                prescriptions.map((item) => item.patient?._id).filter(Boolean),
              ).size
            }
          </Title>
        </Card>

        <Card withBorder>
          <Text size="sm" c="dimmed">
            Available doctors
          </Text>
          <Title order={2} mt="xs">
            {doctors.length}
          </Title>
        </Card>
      </SimpleGrid>

      <Card withBorder>
        <TextInput
          placeholder="Search patient, patient ID, doctor, or diagnosis..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      </Card>

      <Card withBorder>
        <Title order={4} mb="md">
          Prescription history
        </Title>

        {filteredPrescriptions.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No matching prescriptions found.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={750}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Patient</Table.Th>
                  <Table.Th>Doctor</Table.Th>
                  <Table.Th>Diagnosis</Table.Th>
                  <Table.Th>Medicines</Table.Th>
                  <Table.Th>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {filteredPrescriptions.map((item) => (
                  <Table.Tr key={item._id}>
                    <Table.Td>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Table.Td>

                    <Table.Td>
                      <Text fw={500}>{item.patient?.name || "Unknown"}</Text>
                      <Text size="xs" c="dimmed">
                        {item.patient?.patientId || ""}
                      </Text>
                    </Table.Td>

                    <Table.Td>{item.doctor?.name || "Unknown"}</Table.Td>

                    <Table.Td>
                      <Text lineClamp={2}>{item.diagnosis}</Text>
                    </Table.Td>

                    <Table.Td>
                      <Badge variant="light">
                        {item.medicines?.length || 0} medicines
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Tooltip label="View prescription">
                        <ActionIcon
                          variant="light"
                          onClick={() => openPrescription(item)}
                          aria-label="View prescription"
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      {/* Create prescription modal */}
      <Modal
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        title="Create prescription"
        size="xl"
        centered
        closeOnClickOutside={!saving}
      >
        <form onSubmit={createPrescription}>
          <Stack gap="md">
            <Select
              label="Patient"
              placeholder="Select a patient"
              data={patientOptions}
              searchable
              required
              value={form.patient || null}
              onChange={(value) => updateField("patient", value || "")}
            />

            <Select
              label="Doctor"
              placeholder="Select a doctor"
              data={doctorOptions}
              searchable
              required
              value={form.doctor || null}
              onChange={(value) => updateField("doctor", value || "")}
            />

            <Textarea
              label="Diagnosis"
              placeholder="Enter the clinician's diagnosis"
              required
              minRows={2}
              value={form.diagnosis}
              onChange={(event) =>
                updateField("diagnosis", event.currentTarget.value)
              }
            />

            <Textarea
              label="Clinical notes"
              minRows={2}
              value={form.clinicalNotes}
              onChange={(event) =>
                updateField("clinicalNotes", event.currentTarget.value)
              }
            />

            <Group justify="space-between">
              <Title order={4}>Medicines</Title>
              <Button
                type="button"
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={addMedicine}
              >
                Add medicine
              </Button>
            </Group>

            {form.medicines.map((medicine, index) => (
              <Card withBorder key={index}>
                <Group justify="space-between" mb="sm">
                  <Text fw={600}>Medicine {index + 1}</Text>

                  <ActionIcon
                    type="button"
                    variant="light"
                    color="red"
                    disabled={form.medicines.length === 1}
                    onClick={() => removeMedicine(index)}
                    aria-label={`Remove medicine ${index + 1}`}
                  >
                    <IconTrash size={17} />
                  </ActionIcon>
                </Group>

                <Stack gap="sm">
                  <TextInput
                    label="Medicine name"
                    required
                    value={medicine.name}
                    onChange={(event) =>
                      updateMedicine(index, "name", event.currentTarget.value)
                    }
                  />

                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <TextInput
                      label="Dosage"
                      placeholder="As prescribed"
                      required
                      value={medicine.dosage}
                      onChange={(event) =>
                        updateMedicine(
                          index,
                          "dosage",
                          event.currentTarget.value,
                        )
                      }
                    />

                    <TextInput
                      label="Frequency"
                      placeholder="As prescribed"
                      required
                      value={medicine.frequency}
                      onChange={(event) =>
                        updateMedicine(
                          index,
                          "frequency",
                          event.currentTarget.value,
                        )
                      }
                    />

                    <TextInput
                      label="Duration"
                      placeholder="As prescribed"
                      required
                      value={medicine.duration}
                      onChange={(event) =>
                        updateMedicine(
                          index,
                          "duration",
                          event.currentTarget.value,
                        )
                      }
                    />

                    <NumberInput
                      label="Quantity"
                      min={1}
                      required
                      value={medicine.quantity}
                      onChange={(value) =>
                        updateMedicine(index, "quantity", value || 1)
                      }
                    />
                  </SimpleGrid>

                  <Textarea
                    label="Instructions"
                    placeholder="Additional instructions"
                    value={medicine.instructions}
                    onChange={(event) =>
                      updateMedicine(
                        index,
                        "instructions",
                        event.currentTarget.value,
                      )
                    }
                  />
                </Stack>
              </Card>
            ))}

            <Textarea
              label="General advice"
              minRows={2}
              value={form.advice}
              onChange={(event) =>
                updateField("advice", event.currentTarget.value)
              }
            />

            <TextInput
              type="date"
              label="Follow-up date"
              value={form.followUpDate}
              onChange={(event) =>
                updateField("followUpDate", event.currentTarget.value)
              }
            />

            <Group justify="flex-end">
              <Button
                type="button"
                variant="default"
                disabled={saving}
                onClick={() => setFormOpened(false)}
              >
                Cancel
              </Button>

              <Button type="submit" loading={saving}>
                Save prescription
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Prescription details / print view */}
      <Modal
        opened={viewOpened}
        onClose={() => setViewOpened(false)}
        title="Prescription details"
        size="lg"
        centered
      >
        {selectedPrescription && (
          <Stack gap="md" className="prescription-print">
            <div>
              <Title order={3}>Clinic Prescription</Title>
              <Text c="dimmed" size="sm">
                Date:{" "}
                {new Date(selectedPrescription.createdAt).toLocaleDateString()}
              </Text>
            </div>

            <Card withBorder>
              <Text fw={600}>Patient</Text>
              <Text>{selectedPrescription.patient?.name || "Unknown"}</Text>
              <Text size="sm" c="dimmed">
                ID: {selectedPrescription.patient?.patientId || "—"}
              </Text>
              <Text size="sm">
                Phone: {selectedPrescription.patient?.phone || "—"}
              </Text>
            </Card>

            <Card withBorder>
              <Text fw={600}>Doctor</Text>
              <Text>{selectedPrescription.doctor?.name || "Unknown"}</Text>
              <Text size="sm" c="dimmed">
                {selectedPrescription.doctor?.specialization || ""}
              </Text>
            </Card>

            <div>
              <Text fw={600}>Diagnosis</Text>
              <Text>{selectedPrescription.diagnosis}</Text>
            </div>

            {selectedPrescription.clinicalNotes && (
              <div>
                <Text fw={600}>Clinical notes</Text>
                <Text>{selectedPrescription.clinicalNotes}</Text>
              </div>
            )}

            <Title order={4}>Medicines</Title>

            {selectedPrescription.medicines?.map((medicine, index) => (
              <Card withBorder key={medicine._id || index}>
                <Text fw={600}>
                  {index + 1}. {medicine.name}
                </Text>
                <Text size="sm">Dosage: {medicine.dosage}</Text>
                <Text size="sm">Frequency: {medicine.frequency}</Text>
                <Text size="sm">Duration: {medicine.duration}</Text>
                <Text size="sm">Quantity: {medicine.quantity}</Text>
                {medicine.instructions && (
                  <Text size="sm" mt="xs">
                    Instructions: {medicine.instructions}
                  </Text>
                )}
              </Card>
            ))}

            {selectedPrescription.advice && (
              <div>
                <Text fw={600}>Advice</Text>
                <Text>{selectedPrescription.advice}</Text>
              </div>
            )}

            {selectedPrescription.followUpDate && (
              <div>
                <Text fw={600}>Follow-up date</Text>
                <Text>
                  {new Date(
                    selectedPrescription.followUpDate,
                  ).toLocaleDateString()}
                </Text>
              </div>
            )}

            <Button
              leftSection={<IconPrinter size={17} />}
              onClick={printPrescription}
            >
              Print prescription
            </Button>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
};

export default Prescriptions;
