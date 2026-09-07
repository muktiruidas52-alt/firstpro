// Replace this string with your Web App URL from Step 1
const scriptURL = 'https://script.google.com/macros/s/AKfycbzupN1WKsDyqmYl_xkaO4GOxn_J_S22htThCnIPBHBs7pv2bU8NbkGSHGKfzjC2I-8B/exec';

const form = document.getElementById('marksheetForm');
const subjectInputs = document.querySelectorAll('.subject-input');

// Elements for Live Preview
const displayTotal = document.getElementById('displayTotal');
const displayPercentage = document.getElementById('displayPercentage');
const displayGrade = document.getElementById('displayGrade');
const displayResult = document.getElementById('displayResult');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');

// Variable holders for calculated metrics
let calculatedMetrics = {
  total: 0,
  percentage: 0,
  grade: 'F',
  result: 'FAIL'
};

// Listen for mark input changes to recalculate stats live
subjectInputs.forEach(input => {
  input.addEventListener('input', calculateMarksheet);
});

function calculateMarksheet() {
  let sub1 = parseFloat(document.getElementById('sub1').value) || 0;
  let sub2 = parseFloat(document.getElementById('sub2').value) || 0;
  let sub3 = parseFloat(document.getElementById('sub3').value) || 0;
  let sub4 = parseFloat(document.getElementById('sub4').value) || 0;

  // 1. Total & Percentage Calculation
  let total = sub1 + sub2 + sub3 + sub4;
  let percentage = (total / 400) * 100;

  // 2. Minimum Pass Mark Rule (Pass mark = 35 for each subject)
  let isPass = sub1 >= 35 && sub2 >= 35 && sub3 >= 35 && sub4 >= 35;

  // 3. Grade Logic
  let grade = 'F';
  if (isPass) {
    if (percentage >= 85) grade = 'A+';
    else if (percentage >= 75) grade = 'A';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else grade = 'D';
  }

  let resultText = isPass ? 'PASS' : 'FAIL';

  // Store in global object for submission
  calculatedMetrics = {
    total: total,
    percentage: percentage.toFixed(2),
    grade: grade,
    result: resultText
  };

  // Update UI UI Preview
  displayTotal.textContent = `${total} / 400`;
  displayPercentage.textContent = `${percentage.toFixed(2)}%`;
  displayGrade.textContent = grade;
  
  displayResult.textContent = resultText;
  displayResult.className = `badge ${isPass ? 'pass' : 'fail'}`;
}

// Form Submission Event Handler
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Disable button while processing
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  statusMessage.style.display = 'none';

  // Prepare form payload
  const formData = new FormData();
  formData.append('studentName', document.getElementById('studentName').value);
  formData.append('rollNumber', document.getElementById('rollNumber').value);
  formData.append('sub1', document.getElementById('sub1').value);
  formData.append('sub2', document.getElementById('sub2').value);
  formData.append('sub3', document.getElementById('sub3').value);
  formData.append('sub4', document.getElementById('sub4').value);
  
  // Pass calculated fields to the sheet
  formData.append('total', calculatedMetrics.total);
  formData.append('percentage', calculatedMetrics.percentage + '%');
  formData.append('grade', calculatedMetrics.grade);
  formData.append('result', calculatedMetrics.result);

  // Send request via Fetch API
  fetch(scriptURL, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.result === 'success') {
      showStatus('Marksheet recorded successfully!', 'success');
      form.reset();
      calculateMarksheet(); // Reset UI summary box
    } else {
      showStatus('Failed to record submission. Please try again.', 'error');
    }
  })
  .catch(error => {
    console.error('Error submitting form:', error);
    showStatus('Network error occurred. Please check connection.', 'error');
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Marksheet';
  });
});

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
  statusMessage.style.display = 'block';
}