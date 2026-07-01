"use client"

import { useState, useEffect } from 'react'
import { User, Wallet, CreditCard, Plus, Eye, EyeOff, Settings, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface WalletTransactionItem {
  id: string
  type: 'deposit' | 'spend'
  amount: number
  date: string
  description: string
}

export default function ProfilePage() {
  const { user, wallet, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet'>('profile')
  const [showBalance, setShowBalance] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [isDepositing, setIsDepositing] = useState(false)
  const isAdmin = user?.role === 'Administrator'
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  // Mock wallet data - in real app, this would come from API
  const walletData = {
    balance: Number(wallet?.balance ?? 0),
    currency: wallet?.currency || 'ETB',
  }

  useEffect(() => {
    if (!user || isAdmin || activeTab !== 'wallet') {
      return
    }

    const fetchTransactions = async () => {
      setIsLoadingTransactions(true)
      try {
        const response = await api.get('/wallet/transactions', {
          params: { page: 1, limit: 10 },
        })

        if (response.data?.success && response.data.data?.transactions) {
          const apiTransactions = response.data.data.transactions as any[]
          const mapped: WalletTransactionItem[] = apiTransactions.map((tx) => ({
            id: tx.txn_id,
            type:
              tx.amount !== undefined && Number(tx.amount) > 0
                ? 'deposit'
                : 'spend',
            amount: Number(tx.amount ?? 0),
            date: tx.created_at || tx.processed_at || new Date().toISOString(),
            description:
              tx.description ||
              (tx.type === 'DEPOSIT' ? 'Wallet deposit' : 'Wallet transaction'),
          }))
          setTransactions(mapped)
        } else {
          setTransactions([])
        }
      } catch (error) {
        console.error('Failed to load wallet transactions', error)
        setTransactions([])
      } finally {
        setIsLoadingTransactions(false)
      }
    }

    fetchTransactions()
  }, [user, isAdmin, activeTab])

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return

    setIsDepositing(true)
    try {
      const amount = parseFloat(depositAmount)

      await api.post('/wallet/deposit', {
        amount,
        payment_method: 'TELEBIRR',
        external_txn_id: 'DEV_FAKE_DEPOSIT',
      })

      await refreshUser()

      try {
        const response = await api.get('/wallet/transactions', {
          params: { page: 1, limit: 10 },
        })

        if (response.data?.success && response.data.data?.transactions) {
          const apiTransactions = response.data.data.transactions as any[]
          const mapped: WalletTransactionItem[] = apiTransactions.map((tx) => ({
            id: tx.txn_id,
            type:
              tx.amount !== undefined && Number(tx.amount) > 0
                ? 'deposit'
                : 'spend',
            amount: Number(tx.amount ?? 0),
            date: tx.created_at || tx.processed_at || new Date().toISOString(),
            description:
              tx.description ||
              (tx.type === 'DEPOSIT' ? 'Wallet deposit' : 'Wallet transaction'),
          }))
          setTransactions(mapped)
        } else {
          setTransactions([])
        }
      } catch (error) {
        console.error('Failed to refresh wallet transactions after deposit', error)
      }

      toast.success(`Successfully deposited ${amount.toLocaleString()} ETB`)
      setDepositAmount('')
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to deposit funds. Please try again.'
      toast.error(message)
    } finally {
      setIsDepositing(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-accent-300">Please sign in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-accent-300">Manage your account and wallet settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-accent-500 text-white'
                : 'text-accent-300 hover:text-white hover:bg-accent-800'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profile Info
          </button>
          {!isAdmin && (
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'wallet'
                  ? 'bg-accent-500 text-white'
                  : 'text-accent-300 hover:text-white hover:bg-accent-800'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              My Wallet
            </button>
          )}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center mr-6">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-accent-300 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-accent-300">
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-accent-400">Email</p>
                    <p className="text-white">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-3 text-accent-300">
                    <Phone className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-accent-400">Phone</p>
                      <p className="text-white">{user.phone}</p>
                    </div>
                  </div>
                )}

                {user.dateOfBirth && (
                  <div className="flex items-center space-x-3 text-accent-300">
                    <Calendar className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-accent-400">Date of Birth</p>
                      <p className="text-white">{new Date(user.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {(user.city || user.region) && (
                  <div className="flex items-center space-x-3 text-accent-300">
                    <MapPin className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-accent-400">Location</p>
                      <p className="text-white">{[user.city, user.region].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                )}

                {user.gender && (
                  <div className="flex items-center space-x-3 text-accent-300">
                    <User className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-accent-400">Gender</p>
                      <p className="text-white capitalize">{user.gender}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 text-accent-300">
                  <Settings className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-accent-400">Member Since</p>
                    <p className="text-white">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="mt-6 pt-6 border-t border-accent-700">
              <h3 className="text-lg font-semibold text-white mb-4">Verification Status</h3>
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${user.isEmailVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-accent-300">Email {user.isEmailVerified ? 'Verified' : 'Not Verified'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${user.isPhoneVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-accent-300">Phone {user.isPhoneVerified ? 'Verified' : 'Not Verified'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Tab (hidden for Administrators) */}
        {activeTab === 'wallet' && !isAdmin && (
          <div className="space-y-6">
            {/* Wallet Balance Card */}
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Wallet Balance</h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-accent-300 hover:text-white transition-colors"
                >
                  {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-white mb-2">
                  {showBalance
                    ? `${walletData.balance.toLocaleString()} ${walletData.currency}`
                    : '••••••'}
                </div>
                <p className="text-accent-300">Available Balance</p>
              </div>

              {/* Deposit Section */}
              <div className="border-t border-accent-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Add Funds</h3>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-primary-700 border border-accent-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:border-accent-500"
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <button
                    onClick={handleDeposit}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0 || isDepositing}
                    className="px-6 py-3 bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    {isDepositing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Deposit</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-accent-400 mt-2">
                  Note: Withdrawals are not available. Funds can only be used for gifts and marketplace purchases.
                </p>
              </div>
            </div>

            {/* Transaction History */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
              <div className="space-y-4">
                {isLoadingTransactions ? (
                  <p className="text-accent-300">Loading transactions...</p>
                ) : transactions.length === 0 ? (
                  <p className="text-accent-300">No transactions yet.</p>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-3 border-b border-accent-700 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}
                        >
                          {transaction.type === 'deposit' ? (
                            <Plus
                              className={`w-5 h-5 ${
                                transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                              }`}
                            />
                          ) : (
                            <CreditCard className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{transaction.description}</p>
                          <p className="text-sm text-accent-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount} ETB
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
