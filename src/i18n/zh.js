/* Chinese copy (Simplified) — mirrors the structure of en.js exactly. */
import en from './en.js';

const zh = {
  htmlLang: 'zh-Hans',
  langName: '中文',

  meta: {
    title: '武术体育学院 — 2027 年度学生报名',
    formTitle: '学生报名 — 武术体育学院',
    successTitle: '报名完成 — 武术体育学院',
    description:
      '马来西亚武术体育学院课程报名。签署同意书、填写资料、选择学费并上传付款收据，全部在一个页面完成。',
  },

  langToggle: { label: '语言', en: 'EN', zh: '中文' },

  hero: {
    intake: '2027 年度招生 · 报名开放',
    headlineTop: '强健体魄',
    headlineAccent: '淬炼精神',
    subhead:
      '为青少年打造的现代武术课程 —— 由国家级教练亲授，培养纪律、精准与自信。四分钟内为孩子锁定 2027 年度学额。',
    start: '开始报名',
    viewFees: '查看 2027 学费',
    highlights: ['国家级教练团队', '小班教学', '比赛与表演机会'],
    watermark: '武',
  },

  fees: {
    eyebrow: '2027 年度',
    title: '学期学费',
    intro:
      '学费按月计算，须在每个月的第一堂课之前缴清。报名时可勾选一个或多个学期，系统会自动计算总额。',
    classes: '堂课',
    goodToKnow: '温馨提示：',
    note: '补课仅在学院取消课程时提供，家长不得自行取消课程。',
    cta: '立即报名',
    close: '关闭',
    termLabel: (term, year) => `第 ${term} 学期 · ${year} 年`,
    classesCount: (sessions) => `${sessions} 堂课`,
  },

  form: {
    eyebrow: '2027 年度招生',
    title: '学生报名',
    intro:
      '共四个简短的步骤：签署同意书、填写家长与学员资料，然后选择学期并上传付款收据。',
    restored: '我们已恢复您这次填写的草稿 —— 请在第 4 步重新上传付款收据。',
    backToHome: '返回首页',
    needHelp: '需要协助？',
    stepOf: (step, total) => `第 ${step} 步，共 ${total} 步`,
    completed: '已完成',
    continue: '继续',
    back: '返回',
    submit: '提交报名',
    submitting: '提交中…',
    footerRights: (year, name) => `© ${year} ${name}`,
    previewNote: '预览模式 —— 此表单尚未连接 Google 表格。',

    steps: [
      { title: '同意书', meta: '条款与签名' },
      { title: '家长', meta: '您的资料' },
      { title: '学员', meta: '学生资料' },
      { title: '付款', meta: '学费与收据' },
    ],

    agreement: {
      classDetails: {
        title: '上课资料',
        dayLabel: '上课日',
        timeLabel: '时间',
        venueLabel: '地点',
        note: '请在同意以下条款前，先确认上课时间与地点。',
      },
      title: '报名同意书与授权',
      description:
        '请完整阅读同意书内容，然后在卡片下方签名。签名会转换成图片，并附加到此同意书的 PDF 档案中。',
      boxTitle: '条款与条件',
      scrollHint: '请在上方框内向下滚动，阅读所有条款。',
      consentPre: '我已阅读并理解上述条款。我同意为我的孩子报名参加 ',
      consentPost:
        '，并同意按所选学期每月缴付学费，也同意学院就比赛、表演及活动所作的安排。',
      pdfNote:
        '系统会自动生成包含以上条款、您的资料及签名的 PDF 同意书并保存记录。提交后我们会透过电邮发送一份副本给您。',
      pdfLanguageNote: '签署的 PDF 副本以英文版本为依据。',
      nextLabel: '我同意，继续',
      footerHint: '第 2 至第 4 步约需 3 分钟。',
    },

    signature: {
      label: '电子签名',
      awaiting: '等待签名',
      signed: '已签名',
      clear: '清除',
      placeholder: '请在此用滑鼠或手指签名',
      placeholderHint: '请签上与身份证相同的姓名',
      note: '您的签名会转换成图片，并附加到同意书 PDF 中。',
    },

    parent: {
      title: '家长 / 监护人资料',
      description: '这些资料将用于同意书、付款核对以及学院的所有联系用途。',
      name: '姓名（与身份证相同）',
      namePlaceholder: '例：陈伟良',
      ic: '身份证号码（MyKad）',
      icPlaceholder: '900101-14-5678',
      icHint: '共 12 个数字 —— 输入时会自动格式化。',
      phone: '手机号码',
      phonePlaceholder: '012-345 6789',
      phoneHint: '马来西亚格式 —— 012-345 6789 或 011-2345 6789。',
      email: '电邮地址',
      emailPlaceholder: 'you@email.com',
      emailHint: '确认电邮及同意书副本将发送到这个地址。',
      relationship: '与学员的关系',
      relationshipPlaceholder: '请选择…',
      relationships: [
        { value: 'mother', label: '母亲' },
        { value: 'father', label: '父亲' },
        { value: 'guardian', label: '法定监护人' },
        { value: 'grandparent', label: '祖父母 / 外祖父母' },
        { value: 'sibling', label: '兄弟姐妹' },
        { value: 'other', label: '其他亲属' },
      ],
      footerHint: '您的资料只会提供给学院行政团队。',
    },

    athlete: {
      title: '学员资料',
      description: '请填写加入课程的学员资料。身份证号码同时用来计算年龄。',
      name: '英文姓名（与身份证相同）',
      namePlaceholder: '例：Tan Jia Hao',
      chineseName: '中文姓名（与身份证相同）',
      chineseNamePlaceholder: '例：陈家豪',
      chineseNameHint: '用于比赛报名表格与证书。',
      ic: '身份证号码（MyKad）',
      icPlaceholder: '120305-06-7890',
      icHint: '年龄将根据身份证上的出生年份自动计算。',
      ageAuto: '年龄（自动计算）',
      ageEmpty: '输入身份证号码后自动显示年龄',
      yearsOld: (age) => `${age} 岁`,
      ageNote: '仅根据出生年份计算，忽略月份与日期。',
      gender: '性别',
      genders: [
        { value: 'Male', label: '男' },
        { value: 'Female', label: '女' },
        { value: 'Prefer not to say', label: '不透露' },
      ],
      school: '就读学校',
      schoolPlaceholder: '例：吉隆坡中华小学',
      className: '班级 / 年级',
      classNamePlaceholder: '例：四年级 · Joy 班',
      footerHint: '请再次确认姓名的拼写正确。',
    },

    payment: {
      title: '付款与收据',
      description:
        '请勾选所有要报名的学期。应付总额会自动计算，然后请转账并上传收据。',
      selectTerms: '选择学期',
      noneSelected: '尚未选择学期',
      summary: (count, sessions) => `${count} 个学期 · ${sessions} 堂课`,
      bankTitle: '银行转账资料',
      bankVerified: '已验证',
      labels: {
        bank: '银行',
        accountName: '户名',
        accountNumber: '账号',
      },
      copy: (label) => `复制${label}`,
      copied: '已复制',
      totalDue: '应付总额',
      selectAtLeastOne: '请至少选择一个学期',
      receipt: '上传付款收据',
      required: '必填',
      bankInstructions:
        '请转账应付总额，然后在下方上传清晰的转账截图或收据照片。行政团队核对付款后，报名才会确认。',
      uploadTitle: '点击上传，或将文件拖到这里',
      uploadHint: '转账确认截图或照片 · JPG、PNG 或 PDF · 最大 12 MB',
      processing: '正在处理您的收据…',
      uploadedReady: '已上传，可以提交',
      removeReceipt: '移除收据',
      receiptPreview: '收据预览',
      submitAlert:
        '按下「提交报名」后，我们会将您的资料存入报名记录、生成签署后的同意书 PDF，并电邮一份给您。行政团队会在一个工作日内核对您的收据。',
      submitNote: '您的资料与收据会通过加密连线传送，只有学院行政团队可以查看。',
      footerHint: '您将收到一封附有同意书的确认电邮。',
    },

    errors: {
      parentName: '请输入与身份证相同的姓名。',
      nameLetters: '请只使用文字。',
      parentIc: '请输入有效的 12 位马来西亚身份证号码（例：900101-14-5678）。',
      parentPhone: '请输入有效的马来西亚手机号码（例：012-345 6789）。',
      parentEmail: '请输入有效的电邮地址。',
      parentRelationship: '请选择与学员的关系。',
      athleteName: '请输入学员的姓名。',
      athleteChineseName: '请输入中文姓名。',
      athleteIc: '请输入有效的 12 位马来西亚身份证号码。',
      athleteAge: '无法计算年龄 —— 请检查身份证号码的前 6 个数字。',
      athleteGender: '请选择性别。',
      athleteSchool: '请输入就读学校。',
      athleteClass: '请输入班级 / 年级。',
      agreed: '请勾选同意选项后才能继续。',
      signature: '请在框内签名。',
      agreementAlert: '请先勾选同意选项，并在框内签名。',
      terms: '请至少选择一个学期。',
      receipt: '请上传付款收据。',
      receiptType: '请上传付款收据的图片（JPG、PNG）或 PDF。',
      fileTooLarge: (mb) => `该文件超过 ${mb} MB，请上传较小的文件。`,
      fileUnreadable: '无法读取该文件，请尝试其他文件。',
      submit: '发生错误，请再试一次。',
    },
  },

  success: {
    title: '报名已收到',
    subtitle: '欢迎加入学院',
    leadBefore: (firstName) => `${firstName} 的学额已保留。附有签署同意书的确认电邮正在发送至 `,
    leadAfter: '。',
    reference: '报名编号',
    rows: {
      athlete: '学员',
      parent: '家长',
      terms: '学期',
      total: '已付总额',
      receipt: '收据',
    },
    receiptUploaded: '已上传',
    download: '下载同意书',
    backHome: '返回首页',
    nextTitle: '接下来',
    nextSteps: [
      '行政团队会核对您的付款收据 —— 通常在一个工作日内完成。',
      '您会收到 WhatsApp 讯息，通知上课地点、时间及第一堂课详情。',
      '请妥善保存同意书 PDF —— 这是您签署的条款副本。',
    ],
    demoTitle: '预览模式：',
    demoBody:
      ' 没有储存任何资料，也没有发送电邮。请在 .env 加入 Google Apps Script 网址以启用正式连接。',
    noEmail: '10 分钟内未收到电邮？请检查垃圾邮件，或写信至 ',
    another: '为另一位学员报名',
  },

  terms: {
    heading: '条款与条件',
    list: [
      {
        title: '报名与学费',
        body:
          '家长 / 监护人一经报名，即同意为子女报名参加武术体育学院（Wushu Sport Academy）的课程，并承诺在每个学期所选月份的课程开始前缴清当月学费。学费不可转让，仅在学院酌情决定的情况下方可退款。',
      },
      {
        title: '课程调整',
        body:
          '如遇比赛、表演、考试、公共假期或其他活动与课程同日举行，武术体育学院保留临时调整上课时间、地点、教练或班次的权利，并会通过您登记的联络方式尽早通知家长。',
      },
      {
        title: '补课安排',
        body:
          '补课仅在学院取消课程时提供。家长不得自行取消课程。如学生因病或其他合理原因无法出席，必须提前向行政人员及教练请假；未经批准的缺席将被记录在案。',
      },
      {
        title: '可接受的请假理由',
        body:
          '仅接受病假（生病，必要时须附病假单）、比赛或学校正式考试作为补课理由。私人假期、家庭旅行及其他个人原因不获接受，亦不提供补课或退款。',
      },
      {
        title: '签名与同意',
        body:
          '本表格中的电子签名与手写签名具有同等法律效力。家长 / 监护人确认所提供的资料真实准确，并同意学院为报名、缴费、安全及沟通用途储存与使用这些资料。',
      },
    ],
  },

  /* The signed PDF is always issued in English (jsPDF cannot render Chinese). */
  pdf: en.pdf,
};

export default zh;
