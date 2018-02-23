Settings.MinSimilarity = 0.80
if exists("1502614409122.png"):
    
    type("1502614451460.png", "www@openb.net" + Key.ENTER)
    if exists("Screen Shot 2017-08-13 at 5.00.16 PM.png",5):
        type("Screen Shot 2017-08-13 at 5.00.16 PM.png","A<Tma3ZT" + Key.ENTER)
    else:
        type("1502632022400.png","A<Tma3ZT" + Key.ENTER)
 
waitVanish("1502615147220.png",90)
if exists("1502632337328.png",60):
    click("1502614643713.png")
# end test for login








Settings.MinSimilarity = 0.50
# test dashboard and user management

if exists("1502618082213.png",15):
    print "SUCCESS: Recruitment landing toolbar works"
else:
    print "ERROR: Recruitment landing toolbar is different" 
    print find("1502618082213.png",15).text().strip()
    
if exists("1502676172888.png",5):
   print "SUCCESS: Recruitment landing dashboard has the right lanes"
else:
    print "ERROR: Recruiment landing dashboard"
    print find("1502676172888.png",5).text().strip()
#click on get focus of window, to test partial flows. wont do anything during normal tests anyway
click("1502624154420.png")
    
click("1502624048634.png")
click("1502622080881.png")
if exists("1502622116040.png",15):
    print "SUCCESS: ERPNext Dashboard loaded"
else:
    print "ERROR: ERPNext Dashboard not loaded"

click("1502622174249.png")
click("1502622188051.png")
click("1502622222445.png")
if exists("1502622264587.png",5):
    print "SUCCESS: Menu create task exists"
else:
    print "ERROR: Menu create task does not exist"


if exists("1502622329858.png",5):
    print "SUCCESS: Menu has manage users button"
    click("1502622371387.png")
    if exists("1502622402213.png",5):
        print "SUCCESS: Management screen exists with test user as first row"
        #http://doc.sikuli.org/tutorials/checkone/checkone.html
        
        selfasspartial = find("1502622639738.png").below(100)
        deletepermission = selfasspartial.find("1502622725546.png")
        click(deletepermission)
        if not exists("1502622902737.png"):
            selfassfull = find("1502624314757.png").below(800)
            print "SUCCESS: Management delete permission works"
            
            dropzone = selfassfull.find("1502624348555.png")
            
            dragDrop("1502624461718.png", dropzone)
            if exists("1502623095551.png"):
                print "SUCCESS: Management add role works"
                click("1502624555345.png")
                
            else:
                print "ERROR: management add role"
            
            
        else:
            print "ERROR: Management delete permission"
            
        
    else:
        print "ERROR: Management screen does not exist with test user as first row"
else:
    print "ERROR: Menu does not have manage users button"
    
# end dashboard and user management tests










#click on useless thign to get focus
click("1502627315984.png")
# create self assessment test loop
if exists("1502627037292.png",20):
    click("1502624613573.png") 
    if exists("1502626920367.png",5):
        print "SUCCESS: Create Job Applicant NA Task loaded"
        applicant_name = find("1502627764510.png")
        applicant_nameField = applicant_name.find("1502627886467.png")
        type(applicant_nameField, "OpenB.Net Website")
        email_address = find("1502627795549.png")
        type(email_address.find("1502627938812.png"),"www@openb.net")
        applicantstatus = find("1502627824588.png")
        click(applicantstatus.find("1502625353940.png"))
        click("Screen Shot 2017-08-13 at 8.40.01 PM.png")
        type("1502628054135.png", "I want to work in singapore if you pay me many money and i can sit on my ass all day")
        if exists("1502628157514.png"):
            print "SUCCESS: Entering data in task works"
        else:
            print "ERROR: Entering data in task doesnt work"
   
        
    else:
        print "ERROR: Create Job Applicant NA Task isnt as expected"


    if exists("1502628230327.png",30):
        print "SUCCESS: MOM SAT module loaded"
        salary = find("1502628623727.png")
        type(salary.find("1502628644976.png"),"25000")
        occuptation = find("1502629073416.png")
        type(occuptation.find("1502629090891.png"),"technolog")
        occuptationdropdown = "occuptationresult-2.jpg"
        if exists(occuptationdropdown,15):
            click(occuptationdropdown)
        else:
            type(Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE)
            click("1502636869231.png")   
            type(occuptation.find("1502629090891.png"),"technolog")
            if exists(occuptationdropdown,30):
                click(occuptationdropdown)
            else:
                type(Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE+Key.BACKSPACE)
                click("1502636869231.png")   
                type(occuptation.find("1502629090891.png"),"technolog")
                if exists(occuptationdropdown,5):
                    click(occuptationdropdown)
                else:
                    print "ERROR: Occuptation dropdown not found after 3 tries"
        if exists("1502633900731.png"):
            print "SUCCESS: Occuptation dropdown works"
                
    else:
        print "ERROR: MOM SAT module failed"

    wheel("1502635574762.png",WHEEL_UP,12)

    workingexp = "workingexp.png"
    if exists(workingexp,2):
        click("1502637874270.png")
        click("workingexpresult.jpg")
        if exists("1502635947624.png"):
            print "SUCCESS: working exp works"
        else:
            print "ERROR: working exp"
    else:
        print "ERROR: working exp"

    sgworkingexp = "sgworkingexp.png"
    click(sgworkingexp.find(selectbutton))
    if exists("sgworkingexpresult.jpg"):
        print "SUCCESS: sg working exp"
    else:
        print "ERROR: sg working exp"
    
        
        
        
        

else:
    print "ERROR: Create Self assessment test button not available"
    
    
    
    
    
    
