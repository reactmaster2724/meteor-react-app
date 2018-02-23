import React, { Component, PropTypes } from 'react'

export default class ActionMom_sat extends Component {
  constructor(props){
    super(props);
    ////console.log("ActionMom_sat");
  }

  componentWillMount(){
    $('#mom-sat').on("load", function(){

      var iframe = $('#mom-sat').contents();

      // If on 3rd page of mom-sat, set event handler on Go button

      // if (iframe.find('[value="Go"]').length == 0) { alert("MOM has probably changed their Self assessment test page, please contact support") };

      if (iframe.find('[value="Go"]').length > 0) {

        iframe.find('[value="Go"]').click(function(){
          var SalaryID = iframe.find('#SalaryID').val();
          $('#SalaryID').val(SalaryID);

          var JobSearchID = iframe.find('#JobSearchID').val();
          $('#JobSearchID').val(JobSearchID);


          var ExperienceID = iframe.find('[name="ExperienceID"]').val();
          $('#ExperienceID').val(ExperienceID);

                  
          var ExperienceLocalID = iframe.find('[name="ExperienceLocalID"]').val();
          $('#ExperienceLocalID').val(ExperienceLocalID);

                  
          var numberOfEducation = iframe.find('#numberOfEducation').val();
          $('#numberOfEducation').val(numberOfEducation);

          var countrySelected = iframe.find('#countrySelected').val();
          $('#countrySelected').val(countrySelected);

          var stateSelected = iframe.find('#stateSelected').val();
          $('#stateSelected').val(stateSelected);

          var nameSelected = iframe.find('#nameSelected').val();
          $('#nameSelected').val(nameSelected);

          var firstQual = iframe.find('#firstQual').val();
          $('#firstQual').val(firstQual);

          var firstFacultySel= iframe.find('#firstFacultySel').val();
          $('#firstFacultySel').val(firstFacultySel);

          var firstEduSpecSelected = iframe.find('#firstEduSpecSelected').val();
          $('#firstEduSpecSelected').val(firstEduSpecSelected);

          var firstStudymodeID = iframe.find('[NAME="firstStudymodeID"]').val();
          $('#firstStudymodeID').val(firstStudymodeID);

          var yearStudy = iframe.find('#yearStudy').val();
          $('#yearStudy').val(yearStudy);

          var monthStudy= iframe.find('#monthStudy').val();
          $('#monthStudy').val(monthStudy);

          var firstYearGrad = iframe.find('#firstYearGrad').val();
          $('#firstYearGrad').val(firstYearGrad);

          var NationalityID = iframe.find('[NAME="NationalityID"]').val();
          $('#NationalityID').val(NationalityID);

          var DOB = iframe.find('#DOB').val();
          $('#DOB').val(DOB);

          var DOA = iframe.find('#DOA').val();
          $('#DOA').val(DOA);
        })
      }

      // end 3rd page mom-sat events
    })
  }

  render(){
    return (
      <div>
        <div className="panel panel-default mom-sat-module">
          <div className="panel-heading">
            <h3>MOM Pass Application self assessment test</h3>
          </div>
          <div className="panel-body">
            <div className="text-center">
              <iframe height="1200" id="mom-sat" name="mom-sat" src="https://services.mom.gov.sg/sat/satservlet?isCorrectFlow=2&CountryID=SG&TypeOfUser=Employer" width="800">
               </iframe>
            </div>
          </div>
        </div>
      </div>
    )
  }
}