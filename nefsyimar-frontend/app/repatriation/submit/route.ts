import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const storageDir = path.join(process.cwd(), 'repatriation-data')
const uploadDir = path.join(process.cwd(), 'public', 'repatriation-uploads')
const submissionFile = path.join(storageDir, 'submissions.json')

async function ensureFolders() {
  await fs.mkdir(storageDir, { recursive: true })
  await fs.mkdir(uploadDir, { recursive: true })
}

function getSafeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

async function saveFile(file: File, prefix: string) {
  const safeName = `${prefix}-${getSafeFileName(file.name)}`
  const targetPath = path.join(uploadDir, safeName)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(targetPath, buffer)
  return `/repatriation-uploads/${safeName}`
}

function getTextValue(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName)
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: NextRequest) {
  await ensureFolders()

  const formData = await request.formData()

  const submission = {
    deceased_full_name: getTextValue(formData, 'deceased_full_name'),
    date_of_birth: getTextValue(formData, 'date_of_birth'),
    date_of_death: getTextValue(formData, 'date_of_death'),
    place_of_death: getTextValue(formData, 'place_of_death'),
    passport_or_id: getTextValue(formData, 'passport_or_id'),
    shipping_agency: getTextValue(formData, 'shipping_agency'),
    air_waybill_no: getTextValue(formData, 'air_waybill_no'),
    flight_number: getTextValue(formData, 'flight_number'),
    departure_date: getTextValue(formData, 'departure_date'),
    estimated_arrival_time: getTextValue(formData, 'estimated_arrival_time'),
    receiver_full_name: getTextValue(formData, 'receiver_full_name'),
    receiver_phone: getTextValue(formData, 'receiver_phone'),
    receiver_email: getTextValue(formData, 'receiver_email'),
    death_certificate_file: '',
    embatming_cert_file: '',
    embassy_permit_file: '',
    submitted_at: new Date().toISOString(),
  }

  const fileFields = [
    'death_certificate_file',
    'embatming_cert_file',
    'embassy_permit_file',
  ] as const

  for (const fieldName of fileFields) {
    const fileValue = formData.get(fieldName)
    if (fileValue instanceof File && fileValue.size > 0) {
      submission[fieldName] = await saveFile(fileValue, fieldName)
    }
  }

  try {
    const existing = await fs.readFile(submissionFile, 'utf-8')
    const parsed = JSON.parse(existing)
    if (Array.isArray(parsed)) {
      parsed.push(submission)
      await fs.writeFile(submissionFile, JSON.stringify(parsed, null, 2), 'utf-8')
    } else {
      await fs.writeFile(submissionFile, JSON.stringify([submission], null, 2), 'utf-8')
    }
  } catch {
    await fs.writeFile(submissionFile, JSON.stringify([submission], null, 2), 'utf-8')
  }

  return NextResponse.redirect(new URL('/repatriation?submitted=true', request.url))
}
