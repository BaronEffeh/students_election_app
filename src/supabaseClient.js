// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wgiaqiuywfcqjdptxejr.supabase.co'  
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnaWFxaXV5d2ZjcWpkcHR4ZWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODAwMjAsImV4cCI6MjA2Mzg1NjAyMH0.scFJcTzZz95pNwqjkb-JbauIZcyH0sf9eoREURJ46a4' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
