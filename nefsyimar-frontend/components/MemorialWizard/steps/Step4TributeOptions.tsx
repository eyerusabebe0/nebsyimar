'use client'

import React, { useState } from 'react'
import { Gift, Heart, Target, Wallet, Users, DollarSign, Flower, Flame, Bird, Star, Info, CheckCircle } from 'lucide-react'
import { useWizard } from '../WizardProvider'

const tributeGiftOptions = [
  {
    id: 'flowers',
    name: 'Virtual Flowers',
    icon: Flower,
    description: 'Beautiful digital flower arrangements',
    price: 5
  },
  {
    id: 'candles',
    name: 'Memorial Candles',
    icon: Flame,
    description: 'Light a candle in their memory',
    price: 3
  },
  {
    id: 'doves',
    name: 'Peace Doves',
    icon: Bird,
    description: 'Symbol of peace and remembrance',
    price: 10
  },
  {
    id: 'stars',
    name: 'Memorial Stars',
    icon: Star,
    description: 'Dedicate a star in their honor',
    price: 15
  }
]

const donationPurposes = [
  'Funeral expenses',
  'Medical bills',
  'Family support',
  'Children\'s education fund',
  'Charity in their name',
  'Memorial scholarship',
  'Community project',
  'Other'
]

export default function Step4TributeOptions() {
  const { memorialData, updateTributeOptions } = useWizard()
  const { tributeOptions } = memorialData
  const [customPurpose, setCustomPurpose] = useState('')

  const toggleGift = (giftId: string) => {
    const currentGifts = tributeOptions.allowedGifts || []
    const updatedGifts = currentGifts.includes(giftId)
      ? currentGifts.filter(id => id !== giftId)
      : [...currentGifts, giftId]
    
    updateTributeOptions({ allowedGifts: updatedGifts })
  }

  const handlePurposeChange = (purpose: string) => {
    if (purpose === 'Other') {
      updateTributeOptions({ donationPurpose: customPurpose })
    } else {
      updateTributeOptions({ donationPurpose: purpose })
      setCustomPurpose('')
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ETB`
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="memorial-card rounded-3xl p-6 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-accent-400" />
          </div>
          <h3 className="text-2xl font-semibold text-accent-100 mb-3">
            Tribute & Support Options
          </h3>
          <p className="text-accent-300 max-w-2xl mx-auto leading-relaxed">
            Allow visitors to show their support through virtual tributes and donations. 
            All settings are optional and can be changed at any time.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Virtual Tribute Gifts */}
        <div className="memorial-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-accent-100 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-accent-400" />
                <span>Virtual Tribute Gifts</span>
              </h4>
              <p className="text-accent-400 text-sm mt-1">
                Let visitors send meaningful virtual gifts to honor their memory
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tributeOptions.enableTributeGifts}
                onChange={(e) => updateTributeOptions({ enableTributeGifts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
            </label>
          </div>

          {tributeOptions.enableTributeGifts && (
            <div className="space-y-4">
              <p className="text-accent-300 text-sm mb-4">
                Select which tribute gifts visitors can send:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tributeGiftOptions.map((gift) => {
                  const Icon = gift.icon
                  const isSelected = tributeOptions.allowedGifts?.includes(gift.id)
                  
                  return (
                    <button
                      key={gift.id}
                      onClick={() => toggleGift(gift.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-accent-500 bg-accent-500/10'
                          : 'border-white/10 hover:border-accent-500/50 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-accent-500/20' : 'bg-white/10'
                          }`}>
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-accent-400' : 'text-accent-500'}`} />
                          </div>
                          <div>
                            <div className={`font-semibold ${isSelected ? 'text-accent-100' : 'text-accent-200'}`}>
                              {gift.name}
                            </div>
                            <div className={`text-sm ${isSelected ? 'text-accent-300' : 'text-accent-400'}`}>
                              {gift.description}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${isSelected ? 'text-accent-200' : 'text-accent-400'}`}>
                          {formatCurrency(gift.price)}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-2 flex items-center space-x-1 text-accent-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Enabled</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Donation Support */}
        <div className="memorial-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-accent-100 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-accent-400" />
                <span>Donation Support</span>
              </h4>
              <p className="text-accent-400 text-sm mt-1">
                Allow visitors to make monetary donations to support the family
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tributeOptions.enableDonations}
                onChange={(e) => updateTributeOptions({ enableDonations: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
            </label>
          </div>

          {tributeOptions.enableDonations && (
            <div className="space-y-6">
              {/* Donation Goal */}
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2 flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Donation Goal (Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tributeOptions.donationGoal || ''}
                    onChange={(e) => updateTributeOptions({ donationGoal: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 placeholder-accent-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                    placeholder="0"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent-400 text-sm">
                    ETB
                  </div>
                </div>
                <p className="text-accent-400 text-xs mt-2">
                  Leave blank if you don't want to set a specific goal
                </p>
              </div>

              {/* Donation Purpose */}
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-3">
                  What will donations be used for?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {donationPurposes.map((purpose) => {
                    const isSelected = tributeOptions.donationPurpose === purpose || 
                                     (purpose === 'Other' && !donationPurposes.includes(tributeOptions.donationPurpose))
                    
                    return (
                      <label
                        key={purpose}
                        className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-accent-500 bg-accent-500/10 text-accent-100'
                            : 'border-white/10 text-accent-300 hover:border-accent-500/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="donationPurpose"
                          value={purpose}
                          checked={isSelected}
                          onChange={() => handlePurposeChange(purpose)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          isSelected ? 'border-accent-500' : 'border-white/30'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-accent-500 rounded-full" />}
                        </div>
                        <span className="text-sm font-medium">{purpose}</span>
                      </label>
                    )
                  })}
                </div>

                {/* Custom Purpose Input */}
                {(tributeOptions.donationPurpose === 'Other' || !donationPurposes.includes(tributeOptions.donationPurpose)) && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={tributeOptions.donationPurpose === 'Other' ? customPurpose : tributeOptions.donationPurpose}
                      onChange={(e) => {
                        if (tributeOptions.donationPurpose === 'Other') {
                          setCustomPurpose(e.target.value)
                        } else {
                          updateTributeOptions({ donationPurpose: e.target.value })
                        }
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 placeholder-accent-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                      placeholder="Please specify the purpose..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Family Wallet Integration */}
        <div className="memorial-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-accent-100 flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-accent-400" />
                <span>Family Wallet</span>
              </h4>
              <p className="text-accent-400 text-sm mt-1">
                Connect donations to a family member's wallet for easy management
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tributeOptions.familyWallet.enabled}
                onChange={(e) => updateTributeOptions({
                  familyWallet: { ...tributeOptions.familyWallet, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
            </label>
          </div>

          {tributeOptions.familyWallet.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={tributeOptions.familyWallet.accountHolder}
                  onChange={(e) => updateTributeOptions({
                    familyWallet: { ...tributeOptions.familyWallet, accountHolder: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 placeholder-accent-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                  placeholder="Name of family member managing donations"
                />
              </div>

              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Bank Details (Optional)
                </label>
                <textarea
                  value={tributeOptions.familyWallet.bankDetails || ''}
                  onChange={(e) => updateTributeOptions({
                    familyWallet: { ...tributeOptions.familyWallet, bankDetails: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 placeholder-accent-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all resize-none"
                  placeholder="Bank name, account number, or other payment details for direct donations..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {(tributeOptions.enableDonations || tributeOptions.enableTributeGifts) && (
          <div className="memorial-card rounded-3xl p-6 bg-gradient-to-r from-accent-500/10 to-primary-800/50 border border-accent-500/20">
            <h5 className="text-accent-200 font-medium mb-3 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Support Options Summary</span>
            </h5>
            
            <div className="space-y-2 text-sm">
              {tributeOptions.enableTributeGifts && (
                <div className="flex items-center space-x-2 text-accent-300">
                  <CheckCircle className="w-4 h-4 text-accent-400" />
                  <span>Virtual tribute gifts enabled ({tributeOptions.allowedGifts?.length || 0} types)</span>
                </div>
              )}
              
              {tributeOptions.enableDonations && (
                <div className="flex items-center space-x-2 text-accent-300">
                  <CheckCircle className="w-4 h-4 text-accent-400" />
                  <span>
                    Donations enabled
                    {tributeOptions.donationGoal > 0 && ` (Goal: ${formatCurrency(tributeOptions.donationGoal)})`}
                  </span>
                </div>
              )}
              
              {tributeOptions.familyWallet.enabled && (
                <div className="flex items-center space-x-2 text-accent-300">
                  <CheckCircle className="w-4 h-4 text-accent-400" />
                  <span>Family wallet connected</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Information Note */}
        <div className="memorial-card rounded-3xl p-6 bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-blue-200 font-medium mb-2">Important Information</h5>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• All tribute and donation settings can be modified after the memorial is created</li>
                <li>• Donations go through secure payment processing with transaction fees</li>
                <li>• Virtual tribute gifts are displayed on the memorial page as a lasting tribute</li>
                <li>• You'll receive notifications when donations or tributes are received</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
