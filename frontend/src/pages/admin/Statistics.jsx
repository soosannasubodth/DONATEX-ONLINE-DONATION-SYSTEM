import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// charts
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

export default function Statistics() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [stats, setStats] = useState(null);

	useEffect(() => {
		const role = localStorage.getItem("role");
		if (role !== "admin") {
			navigate("/login");
			return;
		}

		const token = localStorage.getItem("access_token");
		fetch("http://127.0.0.1:8000/api/admin/stats/", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to load statistics");
				return res.json();
			})
			.then((data) => {
				setStats(data);
				setLoading(false);
			})
			.catch((e) => {
				setError(e.message || "Error loading stats");
				setLoading(false);
			});
	}, [navigate]);

	const downloadReport = () => {
		const doc = new jsPDF();
		const date = new Date().toLocaleDateString();

		// Header
		doc.setFontSize(20);
		doc.setTextColor(201, 122, 122); // #C97A7A
		doc.text("DonateX - Platform Report", 14, 22);

		doc.setFontSize(11);
		doc.setTextColor(100);
		doc.text(`Generated on: ${date}`, 14, 30);

		// Key Stats
		doc.setFontSize(14);
		doc.setTextColor(0);
		doc.text("Overview", 14, 45);

		const totals = {
			total_donations: stats.totals?.total_donations ?? stats.total_donations ?? 0,
			total_money: stats.totals?.total_money_amount ?? stats.total_money ?? 0,
			money_count: stats.totals?.money_count ?? 0,
			item_count: stats.totals?.item_count ?? stats.total_items ?? 0,
		};

		const startY = 55;
		doc.setFontSize(10);
		doc.text(`Total Users (Donors + NGOs): ${(stats.total_donors || 0) + (stats.total_ngos || 0)}`, 14, startY);
		doc.text(`Total Funds Raised: Rs. ${totals.total_money.toLocaleString()}`, 14, startY + 7);
		doc.text(`Total Money Donations: ${totals.money_count}`, 14, startY + 14);
		doc.text(`Total Item Donations: ${totals.item_count}`, 14, startY + 21);

		// NGO Table
		doc.setFontSize(14);
		doc.text("Top Performance by NGO", 14, startY + 35);

		const tableData = (stats.per_ngo || []).map((n, i) => [
			i + 1,
			n.ngo_name || "-",
			n.donation_count,
			`Rs. ${(n.total_amount ?? 0).toLocaleString()}`
		]);

		autoTable(doc, {
			startY: startY + 40,
			head: [['#', 'NGO Name', 'Donations Count', 'Total Raised']],
			body: tableData,
			theme: 'grid',
			headStyles: { fillColor: [201, 122, 122] },
		});

		doc.save(`DonateX_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
	};

	if (loading) return <div style={styles.container}><p>Loading statistics...</p></div>;
	if (error) return <div style={styles.container}><p style={{ color: "red" }}>{error}</p></div>;

	// Robustly extract totals, falling back to top-level keys if nested 'totals' is missing
	const rawTotals = stats.totals || {};
	const totals = {
		total_donations: rawTotals.total_donations ?? stats.total_donations ?? (stats.total_donors + stats.total_ngos) ?? 0, // Fallback logic might be inexact for count but safe
		total_money_amount: rawTotals.total_money_amount ?? stats.total_money ?? 0,
		money_count: rawTotals.money_count ?? 0, // Top level doesn't have money_count split, default 0
		item_count: rawTotals.item_count ?? stats.total_items ?? 0,
	};

	// prepare chart data
	const topNgos = (stats.per_ngo || []).slice(0, 8);
	const barData = {
		labels: topNgos.map(n => n.ngo_name || 'Unknown'),
		datasets: [{
			label: 'Total Amount (₹)',
			data: topNgos.map(n => n.total_amount ?? 0),
			backgroundColor: 'rgba(201,122,122,0.8)'
		}]
	};

	const pieData = {
		labels: ['Money Donations', 'Item Donations'],
		datasets: [{
			data: [totals.money_count ?? 0, totals.item_count ?? 0],
			backgroundColor: ['#C97A7A', '#8A3F3F']
		}]
	};

	// monthly line chart
	const months = (stats.monthly || []).map(m => m.label);
	const monthlyAmounts = (stats.monthly || []).map(m => m.total_amount || 0);
	const lineData = {
		labels: months,
		datasets: [{
			label: 'Monthly Amount (₹)',
			data: monthlyAmounts,
			borderColor: '#C97A7A',
			backgroundColor: 'rgba(201,122,122,0.12)',
			tension: 0.3,
		}]
	};

	return (
		<div style={styles.container}>
			<div style={styles.headerRow}>
				<button onClick={() => navigate("/admin-dashboard")} style={styles.btnBackDashboard}>
					<FaArrowLeft /> Back to Dashboard
				</button>
				<button onClick={downloadReport} style={styles.btnDownload}>
					<FaDownload /> Download Report (PDF)
				</button>
			</div>

			<h2 style={styles.heading}>Platform Statistics</h2>
			<div style={styles.cards}>
				<div style={styles.card}>
					<h3>Total Users</h3>
					<p style={styles.big}>{(stats.total_donors || 0) + (stats.total_ngos || 0)}</p>
				</div>

				<div style={styles.card}>
					<h3>Total Money Amount</h3>
					<p style={styles.big}>₹{(totals.total_money_amount ?? 0).toLocaleString()}</p>
				</div>

				<div style={styles.card}>
					<h3>Money Donations</h3>
					<p style={styles.big}>{totals.money_count ?? 0}</p>
				</div>

				<div style={styles.card}>
					<h3>Item Donations</h3>
					<p style={styles.big}>{totals.item_count ?? 0}</p>
				</div>
			</div>

			<h3 style={{ marginTop: 24 }}>NGO Performance (by total received)</h3>
			<div style={styles.tableWrap}>
				<table style={styles.table}>
					<thead>
						<tr>
							<th style={styles.th}>#</th>
							<th style={styles.th}>NGO</th>
							<th style={styles.th}>Donations</th>
							<th style={styles.th}>Total Amount</th>
						</tr>
					</thead>
					<tbody>
						{(stats.per_ngo || []).map((n, idx) => (
							<tr key={n.ngo_id} style={styles.tr}>
								<td style={styles.td}>{idx + 1}</td>
								<td style={styles.td}>{n.ngo_name || "-"}</td>
								<td style={styles.td}>{n.donation_count}</td>
								<td style={styles.td}>₹{(n.total_amount ?? 0).toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, marginTop: 18 }}>
				<div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
					<h4>Top NGOs by Amount</h4>
					<Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
				</div>
				<div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
					<h4>Donations by Type</h4>
					<Pie data={pieData} />
				</div>
			</div>

			<div style={{ marginTop: 18, background: '#fff', padding: 12, borderRadius: 8 }}>
				<h4>Monthly Donation Amount (last 12 months)</h4>
				<Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
			</div>
		</div>
	);
}

const styles = {
	container: { padding: 28, fontFamily: "Segoe UI, sans-serif", background: "#FDF6F6", minHeight: "100vh" },
	heading: { color: "#C97A7A", marginBottom: 20, fontWeight: "700" },
	headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" },
	btnBackDashboard: {
		background: "none",
		border: "1px solid #C97A7A",
		color: "#C97A7A",
		padding: "8px 16px",
		borderRadius: "20px",
		fontSize: "14px",
		fontWeight: "600",
		cursor: "pointer",
		display: "inline-flex",
		alignItems: "center",
		gap: "8px",
		transition: "all 0.3s ease",
		fontFamily: "inherit",
	},
	btnDownload: {
		background: "#C97A7A",
		border: "none",
		color: "#fff",
		padding: "10px 20px",
		borderRadius: "20px",
		fontSize: "14px",
		fontWeight: "600",
		cursor: "pointer",
		display: "inline-flex",
		alignItems: "center",
		gap: "8px",
		boxShadow: "0 4px 12px rgba(201,122,122,0.3)",
		transition: "all 0.3s ease",
		fontFamily: "inherit",
	},
	cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12, marginBottom: 8 },
	card: { background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" },
	big: { fontSize: 20, fontWeight: 700, marginTop: 6, color: "#C97A7A" },
	tableWrap: { marginTop: 12, overflowX: "auto", background: "#fff", padding: 12, borderRadius: 8 },
	table: { width: "100%", borderCollapse: "collapse" },
	th: { textAlign: "left", padding: 10, borderBottom: "1px solid #eee", color: "#666" },
	tr: { borderBottom: "1px solid #f3f3f3" },
	td: { padding: 10 },
};
