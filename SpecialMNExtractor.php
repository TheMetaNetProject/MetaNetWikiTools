<?php
class SpecialMNExtractor extends SpecialPage {
	function __construct() {
		parent::__construct( 'MNExtractor', 'mnextman' );
	}
 
	function execute( $par ) {
		$request = $this->getRequest();
		$output = $this->getOutput();
		$this->setHeaders();

        if (  !$this->userCanExecute( $this->getUser() )  ) {
            $this->displayRestrictionError();
            return;
        }

		# Get request data from, e.g.
		$param = $request->getText( 'param' );
 
		# Do stuff
		# ...
        $output->setPageTitle("Metaphor Extractor Manager");
		$wikitext = <<<HTMLTEXT
<table>
<tr>
  <td>Your name:</td>
  <td><input name="username" size="28" type="text" /></td>
</tr>
<tr>
  <td>Language:</td>
  <td><select name="language" size="1">
     <option value="en">English</option>
     <option value="es">Spanish</option>
     <option value="fa">Persian</option>
     <option value="ru">Russian</option>
  </select></td>
</tr>
<tr>
  <td>Corpora to extract from:</td>
  <td><select multiple="true" name="corpora" size="3" valign="top">
     <option value="bnc">bnc</option>
     <option value="engw">engw</option>
     <option value="esgw">esgw</option>
     <option value="ruwac">ruwac</option>
     <option value="bijankhan">bijankhan</option>
     <option value="hamshahri">hamshahri</option>
  </select></td>
</tr>
<tr>
  <td>File subselection filter:</td>
  <td><input name="filterexpression" size="28" type="text" value="*" /></td>
</tr>
<tr>
  <td>Configuration parameters:</td>
  <td>&nbsp;</td>
</tr>
<tr>
  <td colspan="2"><textarea cols="60" name="configparams" rows="20">

[m4detect]

# ***********************************************
# source and target filtering
# ***********************************************
targetconcepts:POVERTY
#targetfamilies:
#targetframes:
#sourcefamilies:
#sourceframes:

# ***********************************************
# extraction phases (CMS, SBS, LMS, LMS2)
# ***********************************************
extractionphases:CMS
#extractionphases.fa:CMS,LMS2

# ***********************************************
# lemma to frame/concept mapping phases
# ***********************************************
mappingphases:CNMS

# ***********************************************
# score that must be reached for an LM to make it into IARPAs
# output XML file
# ***********************************************
scorethreshold:0.4
#scorethreshold.ru:0.4

# ***********************************************
# do not process sentences longer than this limit (in words)
# ***********************************************
cms.maxsentlength:256

# ***********************************************
# frames in these families are excluded as possible
# source domains
# ***********************************************
cms.excludedfamilies:Governance frames,Democracy frames,
    Economic Inequality frames

# ***********************************************
# leaving blank turns off fn, wn, wiktionary expansion
# ***********************************************
cnms.expansiontypes:

# ***********************************************
# separate option to disable closest frame links
# ***********************************************
cnms.disableclosestframe:True

</textarea></td>
</tr>
<tr>
  <td>Extraction run id:</td>
  <td><input name="jobid" size="28" type="text" /></td>
</tr>
</table>
<p><input name="startbutton" type="button" value="Start extraction" /></p>
  </div>
</div>
HTMLTEXT;
		# $output->addWikiText( $wikitext );
		$output->addHTML( $wikitext );
	}

    /**
     * Override the parent to set where the special page appears on Special:SpecialPages
     * 'other' is the default, so you do not need to override if that's what you want.
     * Specify 'media' to use the <code>specialpages-group-media</code> system interface 
     * message, which translates to 'Media reports and uploads' in English;
     * 
     * @return string
     */
    function getGroupName() {
        return 'metanet';
    }
}
