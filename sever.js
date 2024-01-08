const express = require("express")
const app = express()
const flash = require("express-flash")
const session = require("express-session")
const bodyParser = require('body-parser');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cors = require('cors');

app.use(express.static("jpg"));
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
  name: "code",
  secret: "bughoaizay",
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 3600000,
  },
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors()); 

app.post('/qna', async (req, res) => {  
    try {
      console.log('Received data:', req.body);
    const submittedAnswers = req.body.answers;
    
    // Tạo câu hỏi từ câu trả lời
    const question = `Tôi có sở thích "${submittedAnswers[2]}" và kỹ năng "${submittedAnswers[5]}". Tôi hài lòng và tự hào khi ${submittedAnswers['question4']}. Tôi từng muốn mình thử sức với "${submittedAnswers[9]}". Tôi cũng đã tự nhận thấy rằng đặc điểm cá nhân của tôi "${submittedAnswers[6]}", bản thân có xu hướng làm việc với "${submittedAnswers[3]}" và tài chính gia đình ${submittedAnswers[8]} ảnh hưởng tới lựa chọn nghề nghiệp của tôi. Cuối cùng, để giải quyết vấn đề tôi thường ${submittedAnswers[7]}. Dựa trên những thông tin này, các nghề nghiệp phù hợp với tôi là gì? Vì sao? (liệt kê theo dấu gạch ngang)`;
    console.log('cau hoi:', question)
    // Gửi câu hỏi đến ChatGPT
    const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
      prompt: question,
      max_tokens: 2800,
    }, {
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
      },
    });

    const answer = response.data.choices[0].text.trim();
    
    // Gửi câu trả lời từ ChatGPT về client
    res.json({ answer });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'huongnghiepchatgpt@gmail.com', // Email của bạn
        pass: 'ggwy qaee okkf ipdu'
      }
    });

    const mailOptions = {
        from: 'huongnghiepchatgpt@gmail.com',
        to: `${submittedAnswers[0]}`,
        subject: 'CÚC CU!!! Chúng tôi đã mang câu trả lời đến cho bạn đây.',
        text: `Xin chào ${submittedAnswers[1]} . Dựa trên câu trả lời của bạn, sau đây là một số ngành nghề và thứ bạn cần để theo đuổi các ngành nghề đó.\n\n ${answer} \n\n Hãy luôn nhớ rằng chúng tôi đang hỗ trợ để đưa ra ngành nghề phù hợp với thông tin bạn cung cấp, bạn có thể bắt đầu thay đổi để theo đuổi ước mơ\n\n Cảm ơn bạn vì đã quan tâm đến nghề nghiệp của bản thân cũng như ứng dụng của chúng tôi.\n Nếu bạn hài lòng hay có những thắc mắc, hãy liên hệ với chúng tôi qua email.\n\n Chân thành cảm ơn.`,
      };

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/contact', async (req, res) => {
  try {
    // Extract data from the request body
    const { feeling, fullName, email, number, message } = req.body;

    // Your email configuration (replace with your actual email and credentials)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'huongnghiepchatgpt@gmail.com', // Email của bạn
        pass: 'ggwy qaee okkf ipdu'
      },
    });

    // Email content
    const mailOptions = {
      from: 'huongnghiepchatgpt@gmail.com', // Replace with your email
      to: 'huongnghiepchatgpt@gmail.com', // Replace with the recipient email
      subject: 'Đánh giá từ người dùng',
      html: `
        <p>Feeling: ${feeling}</p>
        <p>Full Name: ${fullName}</p>
        <p>Email: ${email}</p>
        <p>Number: ${number}</p>
        <p>Message: ${message}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Respond to the client
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error handling contact form submission:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



// Routes
app.get('/', (req, res) => {
    res.render("home.ejs")
})

app.get('/qna', (req, res) => {
  res.render("qna.ejs")
})

app.get('/about', (req, res) => {
  res.render("about.ejs")
})

app.get('/contact', (req, res) => {
  res.render("contact.ejs")
})





app.listen(2007)