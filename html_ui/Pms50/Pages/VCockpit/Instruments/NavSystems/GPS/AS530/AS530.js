class AS530 extends BaseGPS {
    get templateID() { return "AS530"; }
    connectedCallback() {
        super.connectedCallback();
        this.menuMaxElems = 11;
        var defaultNav = new GPS_DefaultNavPage(5, [3, 4, 9, 7, 10]);
        defaultNav.element.addElement(new MapInstrumentElement());
        this.pageGroups = [
            new NavSystemPageGroup("NAV", this, [
                defaultNav,
                new NavSystemPage("Map", "Map", new NavSystemElementGroup([new MapInstrumentElement(), new GPS_MapInfos()])),
                new NavSystemPage("ComNav", "ComNav", new GPS_ComNav(8)),
            ]),
            new NavSystemPageGroup("WPT", this, [
                new NavSystemPage("AirportLocation", "AirportLocation", new GPS_AirportWaypointLocation(this.airportWaypointsIcaoSearchField)),
                new NavSystemPage("AirportRunway", "AirportRunway", new GPS_AirportWaypointRunways(this.airportWaypointsIcaoSearchField)),
                new NavSystemPage("AirportFrequency", "AirportFrequency", new GPS_AirportWaypointFrequencies(this.airportWaypointsIcaoSearchField, 8)),
                new NavSystemPage("AirportApproach", "AirportApproach", new GPS_AirportWaypointApproaches(this.airportWaypointsIcaoSearchField)),
                new NavSystemPage("Intersection", "Intersection", new GPS_IntersectionWaypoint()),
                new NavSystemPage("NDB", "NDB", new GPS_NDBWaypoint()),
                new NavSystemPage("VOR", "VOR", new GPS_VORWaypoint())
            ]),
            new NavSystemPageGroup("NRST", this, [
                new NavSystemPage("NRSTAirport", "NRSTAirport", new GPS_NearestAirports(4)),
                new NavSystemPage("NRSTIntersection", "NRSTIntersection", new GPS_NearestIntersection(8)),
                new NavSystemPage("NRSTNDB", "NRSTNDB", new GPS_NearestNDB(8)),
                new NavSystemPage("NRSTVOR", "NRSTVOR", new GPS_NearestVOR(8)),
                new NavSystemPage("NRSTAirspace", "NRSTAirspace", new GPS_NearestAirpaces()),
            ]),
            new NavSystemPageGroup("AUX", this, [
                new NavSystemPage("COMSetup", "COMSetup", new GPS_COMSetup())
            ])
        ];
        this.addEventLinkedPageGroup("DirectTo_Push", new NavSystemPageGroup("DRCT", this, [new NavSystemPage("DRCT", "DRCT", new GPS_DirectTo())]));
        this.addEventLinkedPageGroup("FPL_Push", new NavSystemPageGroup("FPL", this, [new NavSystemPage("ActiveFPL", "FlightPlanEdit", new GPS_ActiveFPL())]));
        this.addEventLinkedPageGroup("PROC_Push", new NavSystemPageGroup("PROC", this, [new NavSystemPage("Procedures", "Procedures", new GPS_Procedures())]));
        this.addEventLinkedPageGroup("MSG_Push", new NavSystemPageGroup("MSG", this, [new NavSystemPage("MSG", "MSG", new GPS_Messages())]));
        this.addIndependentElementContainer(new NavSystemElementContainer("VorInfos", "RadioPart", new AS530_VorInfos()));
//PM Modif: Add range and declutter level to map
        this.addIndependentElementContainer(new NavSystemElementContainer("RangeInfos", "MapPart", new AS530_RangeInfos()));
//PM Modif: End add range and declutter level to map
    }
}

class AS530_VorInfos extends NavSystemElement {
    init(root) {
        this.vor = this.gps.getChildById("vorValue");
        this.rad = this.gps.getChildById("radValue");
        this.dis = this.gps.getChildById("disValue");
//PM Modif: check for LOC or VOR
        this.typ = this.gps.getChildById("vorTitle");
//PM Modif: End check for LOC or VOR
    }
    onEnter() {
    }
    onExit() {
    }
    onEvent(_event) {
    }
    onUpdate(_deltaTime) {
//PM Modif: World4Fly Mod integration (Wrong radial and Rounded DME) and check for LOC or VOR
        let radial = "___";
        let ident = "____";
        let distance = "__._";
        // VOR by default
        let type = "VOR";
        if (SimVar.GetSimVarValue("NAV HAS NAV:1", "bool")) {
            let radnum = Math.round(SimVar.GetSimVarValue("NAV RADIAL:1", "degrees"));
            // radnum is from -179 to 180 degrees ...
            radnum = radnum < 0 ? 360 + radnum : radnum;
            radial = radnum.toString();
            ident = SimVar.GetSimVarValue("NAV IDENT:1", "string") != "" ? SimVar.GetSimVarValue("NAV IDENT:1", "string"):"____";
            distance = (SimVar.GetSimVarValue("NAV HAS DME:1", "bool") ? SimVar.GetSimVarValue("NAV DME:1", "Nautical Miles").toFixed(1) : "__._");
            // LOC frequency is < 112Mhz and first decimal digit is odd
            let frequency = SimVar.GetSimVarValue("NAV ACTIVE FREQUENCY:1", "MHz");
            type = frequency && frequency < 112 && Math.trunc(frequency*10)%2 ? "LOC" : "VOR";
        }
        Avionics.Utils.diffAndSet(this.vor, ident);
        Avionics.Utils.diffAndSet(this.typ, type);
        Avionics.Utils.diffAndSet(this.rad, radial + "°");
        Avionics.Utils.diffAndSet(this.dis, distance);
//PM Modif: End World4Fly Mod integration (Wrong radial and Rounded DME) and check for LOC or VOR
    }
}

//PM Modif: Add range and declutter level to map
class AS530_RangeInfos extends NavSystemElement {
    init(root) {
        this.mrange = this.gps.getChildById("MapRangeValue");
        this.dlevel = this.gps.getChildById("MapDeclutterLevel");
    }
    onEnter() {
    }
    onExit() {
    }
    onEvent(_event) {
    }
    onUpdate(_deltaTime) {
        let map = this.gps.getChildById("MapInstrument");
        if (map) {
            Avionics.Utils.diffAndSet(this.mrange, map.getDisplayRange());
            Avionics.Utils.diffAndSet(this.dlevel, map.declutterLevel ? "-" + map.declutterLevel/2 : "");
        }
    }
}
//PM Modif: End add range and declutter level to map

registerInstrument("as530-element", AS530);
//# sourceMappingURL=AS530.js.map