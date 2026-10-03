"""Production-build integration checks against an isolated local test database."""
import urllib.request,urllib.error,json,secrets,pathlib,os
base=os.environ.get('PLATFORM_TEST_BASE_URL','http://127.0.0.1:5191')
def call(path,body=None,cookie='',origin=base):
 headers={'Origin':origin}
 if cookie:headers['Cookie']=cookie
 if body is not None:headers['Content-Type']='application/json'
 req=urllib.request.Request(base+path,data=json.dumps(body).encode() if body is not None else None,headers=headers)
 try:
  with urllib.request.urlopen(req) as r:return r.status,json.loads(r.read() or '{}'),r.headers.get('Set-Cookie','').split(';')[0]
 except urllib.error.HTTPError as r:return r.code,json.loads(r.read() or '{}'),''
def check(condition,label):
 assert condition,label
 print('PASS',label)
code,data,_=call('/api/universities');check(code==200 and len(data['universities'])>=6,'university catalogue')
u=next(x for x in data['universities'] if x['legacySlug']=='fenerbahce')
check(call('/api/university-admin')[0]==401,'admin content is private')
check(call('/api/student',{'action':'save','kind':'university','itemId':u['slug']})[0]==401,'saved items require a session')
check(call('/api/student',{'action':'signup','email':'test@example.invalid','password':'123456789012','name':'Test'},origin='https://attacker.invalid')[0]==403,'cross-origin mutation rejected')
password=secrets.token_urlsafe(20);email='creator-test-'+secrets.token_hex(5)+'@example.invalid'
code,_,cookie=call('/api/student',{'action':'signup','email':email,'password':password,'name':'Local Test Student'});check(code==200 and cookie,'student signup')
check(call('/api/student',{'action':'signup','email':email,'password':password,'name':'Local Test Student'})[0]==409,'duplicate signup blocked')
check(call('/api/student',{'action':'login','email':email,'password':'wrong-password'})[0]==401,'wrong password rejected')
check(call('/api/student',{'action':'save','kind':'university','itemId':u['slug']},cookie)[0]==200,'saved university')
code,account,_=call('/api/student',cookie=cookie);check(len(account['saved'])==1,'saved university is scoped to account')
code,first,_=call('/api/student',{'action':'apply','university':u['slug'],'programId':u['programs'][0]['id'],'consent':True},cookie);check(code==200,'application creates journey')
code,second,_=call('/api/student',{'action':'apply','university':u['slug'],'programId':u['programs'][0]['id'],'consent':True},cookie);check(first['id']==second['id'],'application retries are idempotent')
code,account,_=call('/api/student',cookie=cookie);check(account['journeys'][0]['content']['stages'][3]['status']=='not_started','admission is not invented')
review=dict(program='Local Test Program',degree='bachelor',nationality='Test nationality',yearStarted=2024,studentType='student',overall=8,ratings={k:8 for k in ['education','professors','campus','facilities','administration','internationalSupport','studentLife','location','costValue','accommodation','career']},likes='Test review for local verification',improvements='Test review for local verification',advice='Test review for local verification',monthlyCost=None,currency='USD',accommodationType='',chooseAgain=True,photos=[],evidence=[],consent=True)
code,reviewResult,_=call('/api/student',{'action':'review','university':u['slug'],'content':review},cookie);check(code==200,'review is submitted for verification')
check(call('/api/student',{'action':'review','university':u['slug'],'content':review},cookie)[0]==409,'duplicate university review blocked')
code,public,_=call('/api/platform-content?university='+u['slug']);check(public['score']['count']==0 and public['reviews']==[],'unverified review cannot inflate score or become public')
code,_,admin=call('/api/university-admin/login',{'password':os.environ.get('PLATFORM_TEST_ADMIN_PASSWORD') or pathlib.Path('/tmp/creator-student-admin-password').read_text()});check(code==200,'configured admin login')
check(call('/api/university-admin',{'action':'review','id':reviewResult['id'],'status':'verified_student','method':'none','confirmed':False},admin)[0]==400,'verification requires explicit evidence review')
code,_,_=call('/api/university-admin',{'action':'review','id':reviewResult['id'],'status':'verified_student','method':'manual','confirmed':True},admin);check(code==200,'admin verification')
code,public,_=call('/api/platform-content?university='+u['slug']);check(public['score']['count']==1 and not public['score']['available'],'score threshold enforced')
check('evidence' not in public['reviews'][0]['content'] and 'nationality' not in public['reviews'][0]['content'],'private verification and individual nationality excluded')
# Evidence storage is checked independently of publication permissions.
def upload_evidence(session,journey_id=''):
 boundary='CreatorTest'+secrets.token_hex(8)
 parts=[f'--{boundary}\r\nContent-Disposition: form-data; name="evidence"\r\n\r\ntrue\r\n']
 if journey_id:parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="journeyId"\r\n\r\n{journey_id}\r\n')
 parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="test-only.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4\nTest-only fixture\r\n--{boundary}--\r\n')
 request=urllib.request.Request(base+'/api/student/media',data=''.join(parts).encode(),headers={'Origin':base,'Cookie':session,'Content-Type':'multipart/form-data; boundary='+boundary})
 try:
  with urllib.request.urlopen(request) as response:return response.code,json.loads(response.read())
 except urllib.error.HTTPError as response:return response.code,{}
code,media=upload_evidence(cookie,first['id']);check(code==200,'private application document upload')
check(call('/api/university-media/'+media['id'])[0]==404,'verification evidence has no public access')
with urllib.request.urlopen(urllib.request.Request(base+'/api/university-media/'+media['id'],headers={'Cookie':cookie})) as response:check(response.code==200 and 'no-store' in response.headers.get('Cache-Control',''),'owner access is private and uncached')
code,_,other=call('/api/student',{'action':'signup','email':'creator-other-'+secrets.token_hex(5)+'@example.invalid','password':secrets.token_urlsafe(20),'name':'Local Other Student'});check(code==200,'second isolated account')
check(call('/api/student',cookie=other)[1]['journeys']==[],'another student cannot read a journey')
check(call('/api/university-media/'+media['id'],cookie=other)[0]==404,'another student cannot read private evidence')
check(upload_evidence(other,first['id'])[0]==403,'another student cannot attach documents to a journey')
code,eligible,_=call('/api/universities/'+u['slug']+'/eligibility',{'nationality':'Iran','education':'high-school','degree':'bachelor','programId':u['programs'][0]['id'],'language':'English'});check(code==200 and eligible['result']=='review','missing eligibility rules cannot promise admission')
code,answer,_=call('/api/universities/'+u['slug']+'/assistant',{'question':'Does it have dormitories?','language':'en'});check(code==200 and 'not been verified' in answer['answer'],'assistant does not invent dormitories')
check(call('/api/student',{'action':'travel','university':u['slug'],'kind':'hotel','fields':{'checkIn':'2026-10-10','checkOut':'2026-10-09'},'consent':True},cookie)[0]==400,'hotel date validation')
code,trip,_=call('/api/student',{'action':'travel','university':u['slug'],'kind':'flight','fields':{'departure':'2026-11-01','destination':'Istanbul'},'consent':True},cookie);check(code==200 and trip['status']=='requested','missing provider records assistance, never a booking')
# New discovery drafts import into the existing account without creating applications.
code,countries,_=call('/api/countries');check(code==200 and len(countries['countries'])==7,'seven sourced country destinations')
check(call('/api/country-admin')[0]==401,'country CMS is private')
code,answer,_=call('/api/countries/turkiye/assistant',{'question':'Can students work?','language':'en'});check(code==200 and answer['source']['url'].startswith('https://') and answer['personalAssessmentRequired'],'country assistant cites authority and does not decide eligibility')
draft={'version':1,'updatedAt':int(__import__('time').time()*1000),'preferences':{'field':'dentistry','countryCode':'TR','language':'English','degree':'bachelor','budget':35000,'intake':'2027'},'saved':[{'kind':'country','itemId':'turkiye','content':{'countryCode':'TR'}},{'kind':'program','itemId':u['slug']+'/'+u['programs'][0]['id'],'content':{'title':'Untrusted title'}}]}
code,_,_=call('/api/student',{'action':'sync-draft','draft':draft},cookie);check(code==200,'guest country and programme import')
code,personal,_=call('/api/student',cookie=cookie);check(personal['preferences']['field']=='dentistry' and personal['preferences']['budget']==35000,'student preference persistence')
check(len(personal['journeys'])==1,'import never invents another application')
check(next(x for x in personal['saved'] if x['kind']=='program')['content']['title']==u['programs'][0]['name'],'server canonicalises saved programme data')
before=len(personal['saved']);call('/api/student',{'action':'sync-draft','draft':draft},cookie);check(len(call('/api/student',cookie=cookie)[1]['saved'])==before,'draft import is idempotent')
bad={**draft,'saved':[{'kind':'university','itemId':'istanbul-atlas-university','content':{}},{'kind':'program','itemId':'fake-university/fake-program','content':{}}]}
check(call('/api/student',{'action':'sync-draft','draft':bad},cookie)[0]==400 and len(call('/api/student',cookie=cookie)[1]['saved'])==before,'invalid draft rejected without partial imports')
profile={'firstName':'Local','lastName':'Student','phone':'','homeCountry':'Iran','education':'high-school'}
check(call('/api/student',{'action':'profile','profile':profile},cookie)[0]==200,'progressive private profile update')
check(call('/api/student',cookie=cookie)[1]['profile']['firstName']=='Local','profile remains in its account')
check(call('/api/student',cookie=other)[1]['preferences']['field']=='all','preferences cannot leak to another student')
code,adminCountries,_=call('/api/country-admin',cookie=admin);check(code==200 and len(adminCountries['countries'])==7,'country editor uses existing admin session')
record=adminCountries['countries'][0]
check(call('/api/country-admin',{'country':record,'verified':False},admin)[0]==400,'country publication requires explicit source review')
record['intelligence'][0]['verified_at']='2099-01-01';check(call('/api/country-admin',{'country':record,'verified':True},admin)[0]==400,'country source cannot claim future verification')
record['intelligence'][0]['verified_at']='2026-10-03';record['published']=False
check(call('/api/country-admin',{'country':record,'verified':True},admin)[0]==200,'country CMS accepts reviewed edits')
check(not any(c['code']==record['code'] for c in call('/api/countries')[1]['countries']),'country draft override cannot reappear from seeds')
check(call('/api/student',{'action':'save','kind':'country','itemId':record['slug']},cookie)[0]==400,'unpublished country cannot be newly saved')
record['published']=True;check(call('/api/country-admin',{'country':record,'verified':True},admin)[0]==200,'country publishing restores verified destination')
code,_,_=call('/api/student',{'action':'logout'},cookie);check(code==200 and call('/api/student',cookie=cookie)[1]['student'] is None,'logout revokes server session')
