import React, { useState } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link as RouterLink,
} from "react-router-dom";
import {
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Home as HomeIcon,
  People as PeopleIcon,
  MonetizationOn as MoneyIcon,
} from "@mui/icons-material";

// Create a base URL for API requests
const API_URL = process.env.REACT_APP_API_URL;

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_URL,
});

function App() {
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Loan Platform
            </Typography>
            <Box>
              <IconButton color="inherit" component={RouterLink} to="/">
                <HomeIcon />
              </IconButton>
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/borrowers">
                <PeopleIcon />
              </IconButton>
              <IconButton color="inherit" component={RouterLink} to="/disburse">
                <MoneyIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/borrowers" element={<BorrowerManagement />} />
              <Route path="/disburse" element={<DisburseFunds />} />
            </Routes>
          </Paper>
        </Container>
      </Box>
    </Router>
  );
}

function Home() {
  return (
    <Box textAlign="center" sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Loan Platform
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        Manage borrowers and disburse funds with ease
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        {/* Connected to API: {API_URL} */}
      </Typography>
    </Box>
  );
}

function BorrowerManagement() {
  const [borrowers, setBorrowers] = useState([]);
  const [newBorrower, setNewBorrower] = useState({
    name: "",
    email: "",
    phone: "",
    loanAmount: 0,
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const fetchBorrowers = async () => {
    try {
      const response = await api.get("/borrowers");
      setBorrowers(response.data);
    } catch (error) {
      console.error("Error fetching borrowers:", error);
      setNotification({
        open: true,
        message: "Failed to fetch borrowers",
        type: "error",
      });
    }
  };

  const createBorrower = async () => {
    try {
      await api.post("/borrowers", newBorrower);
      fetchBorrowers();
      setNewBorrower({ name: "", email: "", phone: "", loanAmount: 0 });
      setNotification({
        open: true,
        message: "Borrower added successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating borrower:", error);
      setNotification({
        open: true,
        message: "Failed to create borrower",
        type: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  React.useEffect(() => {
    fetchBorrowers();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Borrowers
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Name"
            value={newBorrower.name}
            onChange={(e) =>
              setNewBorrower({ ...newBorrower, name: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Email"
            value={newBorrower.email}
            onChange={(e) =>
              setNewBorrower({ ...newBorrower, email: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Phone"
            value={newBorrower.phone}
            onChange={(e) =>
              setNewBorrower({ ...newBorrower, phone: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Loan Amount"
            type="number"
            value={newBorrower.loanAmount}
            onChange={(e) =>
              setNewBorrower({ ...newBorrower, loanAmount: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={createBorrower}
            sx={{ height: "100%" }}>
            Add Borrower
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {borrowers.map((borrower) => (
          <Grid item xs={12} md={6} key={borrower.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{borrower.name}</Typography>
                <Typography color="textSecondary">{borrower.email}</Typography>
                <Typography color="textSecondary">
                  Phone: {borrower.phone}
                </Typography>
                <Typography color="textSecondary">
                  Loan Amount: ${parseFloat(borrower.loanAmount).toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={async () => {
                    try {
                      const response = await api.post("/payments/onboard", {
                        borrowerId: borrower.id,
                      });
                      window.location.href = response.data;
                    } catch (error) {
                      console.error("Error onboarding to Stripe:", error);
                      setNotification({
                        open: true,
                        message: "Error onboarding to Stripe",
                        type: "error",
                      });
                    }
                  }}>
                  Onboard to Stripe
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type === "success" ? "success" : "error"}
          sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function DisburseFunds() {
  const [borrowers, setBorrowers] = useState([]);
  const [selectedBorrower, setSelectedBorrower] = useState("");
  const [amount, setAmount] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const fetchBorrowers = async () => {
    try {
      const response = await api.get("/borrowers");
      setBorrowers(response.data);
    } catch (error) {
      console.error("Error fetching borrowers:", error);
      setNotification({
        open: true,
        message: "Failed to fetch borrowers",
        type: "error",
      });
    }
  };

  const disburseFunds = async () => {
    try {
      await api.post("/payments/disburse", {
        borrowerId: selectedBorrower,
        amount: amount,
      });
      setNotification({
        open: true,
        message: "Funds disbursed successfully!",
        type: "success",
      });
      setAmount(0);
      setSelectedBorrower("");
    } catch (error) {
      console.error("Error disbursing funds:", error);
      setNotification({
        open: true,
        message: "Failed to disburse funds",
        type: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  React.useEffect(() => {
    fetchBorrowers();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Disburse Funds
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Select Borrower</InputLabel>
            <Select
              value={selectedBorrower}
              label="Select Borrower"
              onChange={(e) => setSelectedBorrower(e.target.value)}>
              {borrowers.map((borrower) => (
                <MenuItem key={borrower.id} value={borrower.id}>
                  {borrower.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            InputProps={{
              startAdornment: "$",
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={disburseFunds}
            sx={{ height: "100%" }}
            disabled={!selectedBorrower || amount <= 0}>
            Disburse Funds
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type === "success" ? "success" : "error"}
          sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
