'use client'

import React, { useState } from 'react'
import { Upload, Camera, X, Calendar, User, Heart } from 'lucide-react'
import { useWizard } from '../WizardProvider'

const relationOptions = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 
  'Grandchild', 'Friend', 'Colleague', 'Other Family Member'
]

export default function Step1BasicInfo() {
  const { memorialData, updateBasicInfo } = useWizard()
  const { basicInfo } = memorialData
  const [dragActive, setDragActive] = useState(false)

  const handlePhotoUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateBasicInfo({
          photo: file,
          photoPreview: e.target?.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0])
    }
  }

  const removePhoto = () => {
    updateBasicInfo({
      photo: null,
      photoPreview: ''
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="memorial-card rounded-3xl p-8 space-y-8">
        
        {/* Photo Upload Section */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-accent-100 mb-6 flex items-center justify-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Their Photo</span>
          </h3>
          
          {basicInfo.photoPreview ? (
            <div className="relative inline-block">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-accent-500/20 shadow-lg">
                <img 
                  src={basicInfo.photoPreview} 
                  alt="Memorial photo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={removePhoto}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`
                w-40 h-40 mx-auto rounded-full border-2 border-dashed transition-all duration-300 cursor-pointer
                flex flex-col items-center justify-center space-y-2
                ${dragActive 
                  ? 'border-accent-400 bg-accent-500/10' 
                  : 'border-accent-500/30 hover:border-accent-400 hover:bg-accent-500/5'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              <Upload className="w-8 h-8 text-accent-400" />
              <div className="text-accent-300 text-sm text-center px-4">
                <div className="font-medium">Upload Photo</div>
                <div className="text-xs text-accent-400">Drag & drop or click</div>
              </div>
            </div>
          )}
          
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
          />
        </div>

        {/* Basic Information Form */}
        <div className="space-y-6">
          
          {/* Full Name */}
          <div>
            <label className="block text-accent-200 text-sm font-medium mb-2 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              value={basicInfo.name}
              onChange={(e) => updateBasicInfo({ name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 placeholder-accent-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
              placeholder="Enter their full name"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-accent-200 text-sm font-medium mb-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Date of Birth *</span>
              </label>
              <input
                type="date"
                value={basicInfo.dateOfBirth}
                onChange={(e) => updateBasicInfo({ dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-accent-200 text-sm font-medium mb-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Date of Passing *</span>
              </label>
              <input
                type="date"
                value={basicInfo.dateOfPassing}
                onChange={(e) => updateBasicInfo({ dateOfPassing: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                required
              />
            </div>
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-accent-200 text-sm font-medium mb-2 flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Your Relationship *</span>
            </label>
            <select
              value={basicInfo.relation}
              onChange={(e) => updateBasicInfo({ relation: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
              required
            >
              <option value="" className="bg-primary-800">Select your relationship</option>
              {relationOptions.map((relation) => (
                <option key={relation} value={relation} className="bg-primary-800">
                  {relation}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Helper Text */}
        <div className="space-y-4">
          <div className="bg-accent-500/5 border border-accent-500/20 rounded-xl p-4">
            <p className="text-accent-300 text-sm leading-relaxed">
              <span className="font-medium text-accent-200">Privacy Note:</span> This information will be used to create their memorial page. 
              You can adjust privacy settings in later steps to control who can view this memorial.
            </p>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <p className="text-orange-200 text-sm leading-relaxed">
              <span className="font-medium">Ethiopian Memorial Observances:</span> Based on the date of passing, 
              we'll automatically create traditional memorial markers for the 3rd day (Salest), 
              40th day (Arba), and 1-year anniversary (Mut Amet) observances.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
