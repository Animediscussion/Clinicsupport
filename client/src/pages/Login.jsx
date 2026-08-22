import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Center,
  Alert,
} from "@mantine/core";

import { IconAlertCircle } from "@tabler/icons-react";

import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="100vh" bg="gray.1">
      <Paper withBorder shadow="md" p="xl" radius="md" w={400}>
        <Stack>
          <div>
            <Title order={2}>Hospital Management</Title>

            <Text c="dimmed" size="sm">
              Sign in to your account
            </Text>
          </div>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="admin@example.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                required
              />

              <Button type="submit" fullWidth loading={loading}>
                Login
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Center>
  );
}

export default Login;
