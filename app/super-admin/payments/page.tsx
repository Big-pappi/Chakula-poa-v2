"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, Search, Download, TrendingUp, ArrowUpRight, Wallet, 
  Building2, Loader2, AlertTriangle, RefreshCw, Eye, Phone, User,
  Calendar, Clock, CheckCircle2, XCircle, ArrowDownRight
} from "lucide-react";
import { superAdmin } from "@/lib/api/endpoints";
import type { Transaction } from "@/lib/types";

export default function SuperAdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [systemStats, setSystemStats] = useState<{
    total_revenue: number;
    monthly_revenue?: number;
    transactions_count?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter, dateFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { status?: string; start_date?: string; end_date?: string } = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      // Handle date filtering
      const now = new Date();
      if (dateFilter === "today") {
        params.start_date = now.toISOString().split("T")[0];
        params.end_date = now.toISOString().split("T")[0];
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        params.start_date = weekAgo.toISOString().split("T")[0];
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        params.start_date = monthAgo.toISOString().split("T")[0];
      }
      
      const [transactionsRes, statsRes] = await Promise.all([
        superAdmin.getTransactions(params),
        superAdmin.getSystemStats(),
      ]);
      
      if (transactionsRes.data) {
        setTransactions(Array.isArray(transactionsRes.data) ? transactionsRes.data : []);
      } else if (transactionsRes.error) {
        setError(transactionsRes.error);
      }
      
      if (statsRes.data) {
        setSystemStats(statsRes.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load payments data";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `TSh ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `TSh ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `TSh ${(amount / 1000).toFixed(0)}K`;
    }
    return `TSh ${amount.toLocaleString()}`;
  };

  const totalRevenue = transactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const todayRevenue = transactions
    .filter(t => {
      const today = new Date().toISOString().split("T")[0];
      return t.status === "completed" && t.created_at?.startsWith(today);
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingCount = transactions.filter(t => t.status === "pending").length;
  const completedCount = transactions.filter(t => t.status === "completed").length;

  const stats = [
    { 
      title: "Total Revenue", 
      value: formatShortCurrency(systemStats?.total_revenue || totalRevenue), 
      change: "+18%", 
      icon: TrendingUp, 
      color: "text-green-600", 
      bg: "bg-green-50 dark:bg-green-950",
      positive: true
    },
    { 
      title: "Today", 
      value: formatShortCurrency(todayRevenue), 
      change: "+15%", 
      icon: Wallet, 
      color: "text-primary", 
      bg: "bg-primary/10",
      positive: true
    },
    { 
      title: "Completed", 
      value: completedCount.toLocaleString(), 
      change: `${((completedCount / (transactions.length || 1)) * 100).toFixed(0)}%`, 
      icon: CheckCircle2, 
      color: "text-blue-600", 
      bg: "bg-blue-50 dark:bg-blue-950",
      positive: true
    },
    { 
      title: "Pending", 
      value: pendingCount.toLocaleString(), 
      change: pendingCount > 0 ? "Requires attention" : "All clear", 
      icon: Clock, 
      color: "text-amber-600", 
      bg: "bg-amber-50 dark:bg-amber-950",
      positive: pendingCount === 0
    },
  ];

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.payment_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.payer_phone?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "refunded":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      mpesa: "M-Pesa",
      airtel_money: "Airtel Money",
      tigopesa: "Tigo Pesa",
      halopesa: "Halopesa",
      mix_by_yas: "Mix by Yas",
      bank_transfer: "Bank Transfer",
      selcom: "Selcom",
    };
    return methods[method] || method;
  };

  const openDetailDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailDialog(true);
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
          System Payments
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Monitor all customer payments and transactions across locations
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
        <Button variant="outline" className="bg-transparent">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-1.5 sm:p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
              <div className={`flex items-center text-xs ${stat.positive ? 'text-green-600' : 'text-amber-600'}`}>
                {stat.positive ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6 py-4">
              {/* Status Banner */}
              <div className={`rounded-lg p-4 ${
                selectedTransaction.status === "completed" ? "bg-green-50 dark:bg-green-950" :
                selectedTransaction.status === "pending" ? "bg-amber-50 dark:bg-amber-950" :
                selectedTransaction.status === "failed" ? "bg-red-50 dark:bg-red-950" :
                "bg-muted"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Transaction Status</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Customer Information</h4>
                <div className="rounded-lg border p-3 space-y-2">
                  {selectedTransaction.user_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTransaction.user_name}</span>
                    </div>
                  )}
                  {selectedTransaction.payer_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTransaction.payer_phone}</span>
                    </div>
                  )}
                  {selectedTransaction.restaurant_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTransaction.restaurant_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Payment Details</h4>
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium">{getPaymentMethodLabel(selectedTransaction.payment_method)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs">{selectedTransaction.payment_reference}</span>
                  </div>
                  {selectedTransaction.external_reference && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">External Ref</span>
                      <span className="font-mono text-xs">{selectedTransaction.external_reference}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Currency</span>
                    <span>{selectedTransaction.currency || "TZS"}</span>
                  </div>
                </div>
              </div>

              {/* Split Details (if available) */}
              {(selectedTransaction.platform_fee_amount || selectedTransaction.restaurant_amount) && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Payment Split</h4>
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee ({selectedTransaction.platform_fee_percentage || 10}%)</span>
                      <span className="font-medium">{formatCurrency(selectedTransaction.platform_fee_amount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Restaurant Share</span>
                      <span className="font-medium">{formatCurrency(selectedTransaction.restaurant_amount || 0)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Timeline</h4>
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {new Date(selectedTransaction.created_at).toLocaleString()}</span>
                  </div>
                  {selectedTransaction.completed_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Completed: {new Date(selectedTransaction.completed_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="border-border/50">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg">All Transactions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {filteredTransactions.length} transactions found
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by reference, name, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Transactions will appear here when users make payments
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3">
                  {filteredTransactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => openDetailDialog(txn)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(txn.user_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{txn.user_name || "Unknown User"}</p>
                            <p className="text-xs text-muted-foreground">{txn.payer_phone || "-"}</p>
                          </div>
                        </div>
                        {getStatusBadge(txn.status)}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {getPaymentMethodLabel(txn.payment_method)}
                        </span>
                        <span className="font-bold text-sm">
                          {formatCurrency(txn.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono">{txn.payment_reference?.slice(0, 12)}...</span>
                        <span>{new Date(txn.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <Table className="hidden lg:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(txn.user_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{txn.user_name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{txn.payer_phone || "-"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {txn.payment_reference?.slice(0, 15) || txn.id?.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(txn.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getPaymentMethodLabel(txn.payment_method)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {txn.restaurant_name || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(txn.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(txn.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailDialog(txn)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
