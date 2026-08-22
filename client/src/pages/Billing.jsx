import { useEffect, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";

import {
  IconAlertCircle,
  IconCash,
  IconFileInvoice,
  IconPlus,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Billing() {
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    patient: "",
    amount: "",
    description: "",
    paymentMethod: "",
  });

  const [formLoading, setFormLoading] = useState(false);

  // --------------------------------------------------
  // Fetch bills
  // --------------------------------------------------

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/billing");

      setBills(response.data);
    } catch (error) {
      console.error("Failed to fetch bills:", error);

      setError(
        error.response?.data?.message || "Failed to load billing information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // --------------------------------------------------
  // Form handling
  // --------------------------------------------------

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateBill = async (event) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      setError("");

      await api.post("/billing", {
        patient: form.patient,
        amount: Number(form.amount),
        description: form.description,
        paymentMethod: form.paymentMethod,
      });

      setForm({
        patient: "",
        amount: "",
        description: "",
        paymentMethod: "",
      });

      setShowForm(false);

      await fetchBills();
    } catch (error) {
      console.error("Failed to create bill:", error);

      setError(error.response?.data?.message || "Failed to create bill.");
    } finally {
      setFormLoading(false);
    }
  };

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "green";

      case "Pending":
        return "yellow";

      case "Cancelled":
        return "red";

      default:
        return "gray";
    }
  };

  // --------------------------------------------------
  // Filter bills
  // --------------------------------------------------

  const filteredBills = bills.filter((bill) => {
    const patientName = bill.patient?.name?.toLowerCase() || "";

    const invoiceNumber = bill.invoiceNumber?.toLowerCase() || "";

    const searchValue = search.toLowerCase();

    const matchesSearch =
      patientName.includes(searchValue) || invoiceNumber.includes(searchValue);

    const matchesStatus =
      statusFilter === "all" || bill.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const totalBills = bills.length;

  const paidBills = bills.filter((bill) => bill.status === "Paid").length;

  const pendingBills = bills.filter((bill) => bill.status === "Pending").length;

  const totalRevenue = bills
    .filter((bill) => bill.status === "Paid")
    .reduce((total, bill) => total + Number(bill.amount || 0), 0);

  // --------------------------------------------------
  // Table rows
  // --------------------------------------------------

  const rows = filteredBills.map((bill) => (
    <Table.Tr key={bill._id}>
      <Table.Td>
        <Text fw={500}>{bill.invoiceNumber || "-"}</Text>
      </Table.Td>

      <Table.Td>{bill.patient?.name || "Unknown Patient"}</Table.Td>

      <Table.Td>{formatDate(bill.createdAt || bill.date)}</Table.Td>

      <Table.Td>
        <Text fw={600}>{formatCurrency(bill.amount)}</Text>
      </Table.Td>

      <Table.Td>{bill.paymentMethod || "-"}</Table.Td>

      <Table.Td>
        <Badge color={getStatusColor(bill.status)} variant="light">
          {bill.status || "Pending"}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <main style={{ flex: 1 }}>
        <Navbar />

        <div style={{ padding: "24px" }}>
          {/* Header */}

          <Group justify="space-between" mb="xl">
            <div>
              <Title order={2}>Billing</Title>

              <Text c="dimmed" size="sm">
                Manage patient invoices and payments
              </Text>
            </div>

            <Group>
              <Button
                variant="light"
                leftSection={<IconRefresh size={18} />}
                onClick={fetchBills}
              >
                Refresh
              </Button>

              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => setShowForm(true)}
              >
                Create Bill
              </Button>
            </Group>
          </Group>

          {/* Error */}

          {error && (
            <Alert color="red" icon={<IconAlertCircle size={18} />} mb="md">
              {error}
            </Alert>
          )}

          {/* Statistics */}

          <SimpleGrid
            cols={{
              base: 1,
              sm: 2,
              lg: 4,
            }}
            mb="xl"
          >
            <Card withBorder shadow="sm">
              <Group>
                <IconFileInvoice
                  size={32}
                  color="var(--mantine-color-blue-6)"
                />

                <div>
                  <Text size="sm" c="dimmed">
                    Total Bills
                  </Text>

                  <Text fw={700} size="xl">
                    {totalBills}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder shadow="sm">
              <Group>
                <IconCash size={32} color="var(--mantine-color-green-6)" />

                <div>
                  <Text size="sm" c="dimmed">
                    Paid Bills
                  </Text>

                  <Text fw={700} size="xl">
                    {paidBills}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder shadow="sm">
              <Group>
                <IconFileInvoice
                  size={32}
                  color="var(--mantine-color-yellow-6)"
                />

                <div>
                  <Text size="sm" c="dimmed">
                    Pending Bills
                  </Text>

                  <Text fw={700} size="xl">
                    {pendingBills}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder shadow="sm">
              <Group>
                <IconCash size={32} color="var(--mantine-color-teal-6)" />

                <div>
                  <Text size="sm" c="dimmed">
                    Total Revenue
                  </Text>

                  <Text fw={700} size="xl">
                    {formatCurrency(totalRevenue)}
                  </Text>
                </div>
              </Group>
            </Card>
          </SimpleGrid>

          {/* Bills */}

          <Card withBorder shadow="sm" radius="md">
            <Group justify="space-between" mb="md">
              <Title order={4}>Invoices</Title>

              <Group>
                <TextInput
                  placeholder="Search invoice or patient..."
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                />

                <Select
                  placeholder="Status"
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || "all")}
                  data={[
                    {
                      value: "all",
                      label: "All",
                    },
                    {
                      value: "Paid",
                      label: "Paid",
                    },
                    {
                      value: "Pending",
                      label: "Pending",
                    },
                    {
                      value: "Cancelled",
                      label: "Cancelled",
                    },
                  ]}
                  w={140}
                />
              </Group>
            </Group>

            {loading ? (
              <Stack align="center" justify="center" p="xl">
                <Loader />

                <Text c="dimmed">Loading bills...</Text>
              </Stack>
            ) : filteredBills.length === 0 ? (
              <Paper withBorder p="xl" ta="center">
                <Text c="dimmed">No billing records found.</Text>
              </Paper>
            ) : (
              <Table.ScrollContainer minWidth={850}>
                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Invoice</Table.Th>

                      <Table.Th>Patient</Table.Th>

                      <Table.Th>Date</Table.Th>

                      <Table.Th>Amount</Table.Th>

                      <Table.Th>Payment Method</Table.Th>

                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Card>
        </div>
      </main>

      {/* Create Bill Modal */}

      <Modal
        opened={showForm}
        onClose={() => setShowForm(false)}
        title="Create New Bill"
        centered
      >
        <form onSubmit={handleCreateBill}>
          <Stack>
            <TextInput
              label="Patient ID"
              placeholder="Enter patient ID"
              value={form.patient}
              onChange={(event) =>
                handleFormChange("patient", event.currentTarget.value)
              }
              required
            />

            <NumberInput
              label="Amount"
              placeholder="Enter amount"
              min={0}
              prefix="₹ "
              value={form.amount}
              onChange={(value) => handleFormChange("amount", value)}
              required
            />

            <Textarea
              label="Description"
              placeholder="e.g. Consultation and medicines"
              minRows={3}
              value={form.description}
              onChange={(event) =>
                handleFormChange("description", event.currentTarget.value)
              }
              required
            />

            <Select
              label="Payment Method"
              placeholder="Select payment method"
              data={[
                {
                  value: "Cash",
                  label: "Cash",
                },
                {
                  value: "Card",
                  label: "Card",
                },
                {
                  value: "UPI",
                  label: "UPI",
                },
                {
                  value: "Bank Transfer",
                  label: "Bank Transfer",
                },
              ]}
              value={form.paymentMethod}
              onChange={(value) => handleFormChange("paymentMethod", value)}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button
                type="button"
                variant="default"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>

              <Button type="submit" loading={formLoading}>
                Create Bill
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}

export default Billing;
